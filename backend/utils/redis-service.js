const redis = require('redis');

// Redis client configuration
let redisClient = null;
let isRedisConnected = false;

// In-memory fallback for OTPs (dev convenience when Redis is unavailable)
const memoryOtpStore = new Map();

// In-memory fallback for short-lived verification flags
const memoryVerifyStore = new Map();

// Initialize Redis client
const initRedis = async () => {
    const redisEnabledEnv = process.env.REDIS_ENABLED;
    const redisEnabled = redisEnabledEnv === undefined
        ? true
        : !['0', 'false', 'no', 'off'].includes(String(redisEnabledEnv).trim().toLowerCase());

    if (!redisEnabled) {
        if (process.env.NODE_ENV !== 'test') {
            console.log('⏭ Redis disabled via REDIS_ENABLED=false');
        }
        isRedisConnected = false;
        redisClient = null;
        return null;
    }

    try {
        // If initRedis is called twice, avoid recreating a client.
        if (redisClient && (redisClient.isOpen || redisClient.isReady)) {
            return redisClient;
        }

        const maxRetriesEnv = process.env.REDIS_MAX_RETRIES;
        const maxRetries = Number.isFinite(Number(maxRetriesEnv)) ? Number(maxRetriesEnv) : 10;

        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > maxRetries) {
                        console.error('Redis: Max reconnection attempts reached');
                        return new Error('Redis connection failed');
                    }
                    return retries * 100; // Exponential backoff
                },
            },
        });

        redisClient.on('error', (err) => {
            if (process.env.NODE_ENV !== 'test') {
                console.error('Redis Client Error:', err);
            }
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            if (process.env.NODE_ENV !== 'test') {
                console.log('✓ Redis connected successfully');
            }
            isRedisConnected = true;
        });

        redisClient.on('ready', () => {
            if (process.env.NODE_ENV !== 'test') {
                console.log('✓ Redis client ready');
            }
        });

        redisClient.on('reconnecting', () => {
            if (process.env.NODE_ENV !== 'test') {
                console.log('⚠ Redis reconnecting...');
            }
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Redis initialization error:', error);
        }
        isRedisConnected = false;
        // Ensure callers can safely call closeRedis() later.
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.quit();
            }
        } catch (_) {
            // Ignore
        }
        redisClient = null;
        return null;
    }
};

// Get Redis client
const getRedisClient = () => {
    if (!isRedisConnected || !redisClient) {
        console.warn('Redis not connected, operations will be skipped');
        return null;
    }
    return redisClient;
};

// Cache operations
const cacheGet = async (key) => {
    try {
        const client = getRedisClient();
        if (!client) return null;

        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis GET error:', error);
        return null;
    }
};

const cacheSet = async (key, value, expiryInSeconds = 3600) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.setEx(key, expiryInSeconds, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Redis SET error:', error);
        return false;
    }
};

const cacheDel = async (key) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.del(key);
        return true;
    } catch (error) {
        console.error('Redis DEL error:', error);
        return false;
    }
};

const cacheDelPattern = async (pattern) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
        return true;
    } catch (error) {
        console.error('Redis DEL pattern error:', error);
        return false;
    }
};

// Session management
const setSession = async (sessionId, data, expiryInSeconds = 86400) => {
    return await cacheSet(`session:${sessionId}`, data, expiryInSeconds);
};

const getSession = async (sessionId) => {
    return await cacheGet(`session:${sessionId}`);
};

const deleteSession = async (sessionId) => {
    return await cacheDel(`session:${sessionId}`);
};

// OTP management with Redis
const setOTP = async (phone, otp, expiryInSeconds = 600) => {
    try {
        const client = getRedisClient();
        if (!client) {
            memoryOtpStore.set(String(phone), {
                otp: String(otp),
                attempts: 0,
                createdAt: new Date().toISOString(),
                expiresAt: Date.now() + expiryInSeconds * 1000,
            });
            return true;
        }

        const otpData = {
            otp,
            attempts: 0,
            createdAt: new Date().toISOString(),
        };

        await client.setEx(`otp:${phone}`, expiryInSeconds, JSON.stringify(otpData));
        return true;
    } catch (error) {
        console.error('Redis SET OTP error:', error);
        return false;
    }
};

const getOTP = async (phone) => {
    try {
        const client = getRedisClient();
        if (!client) {
            const entry = memoryOtpStore.get(String(phone));
            if (!entry) return null;
            if (Date.now() > entry.expiresAt) {
                memoryOtpStore.delete(String(phone));
                return null;
            }
            return { otp: entry.otp, attempts: entry.attempts, createdAt: entry.createdAt };
        }

        const data = await client.get(`otp:${phone}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis GET OTP error:', error);
        return null;
    }
};

const incrementOTPAttempts = async (phone) => {
    try {
        const client = getRedisClient();
        if (!client) {
            const key = String(phone);
            const entry = memoryOtpStore.get(key);
            if (!entry) return false;
            if (Date.now() > entry.expiresAt) {
                memoryOtpStore.delete(key);
                return false;
            }
            entry.attempts += 1;
            memoryOtpStore.set(key, entry);
            return true;
        }

        const otpData = await getOTP(phone);
        if (!otpData) return false;

        otpData.attempts += 1;
        const ttl = await redisClient.ttl(`otp:${phone}`);
        await cacheSet(`otp:${phone}`, otpData, ttl > 0 ? ttl : 600);
        return true;
    } catch (error) {
        console.error('Redis increment OTP attempts error:', error);
        return false;
    }
};

const deleteOTP = async (phone) => {
    const client = getRedisClient();
    if (!client) {
        memoryOtpStore.delete(String(phone));
        return true;
    }
    return await cacheDel(`otp:${phone}`);
};

// Verification flags (e.g., email OTP verified for registration)
const setVerificationFlag = async (key, expiryInSeconds = 900) => {
    try {
        const client = getRedisClient();
        if (!client) {
            memoryVerifyStore.set(String(key), {
                value: true,
                expiresAt: Date.now() + expiryInSeconds * 1000,
            });
            return true;
        }

        await client.setEx(`verify:${key}`, expiryInSeconds, '1');
        return true;
    } catch (error) {
        console.error('Redis SET verification flag error:', error);
        return false;
    }
};

const getVerificationFlag = async (key) => {
    try {
        const client = getRedisClient();
        if (!client) {
            const entry = memoryVerifyStore.get(String(key));
            if (!entry) return false;
            if (Date.now() > entry.expiresAt) {
                memoryVerifyStore.delete(String(key));
                return false;
            }
            return Boolean(entry.value);
        }

        const data = await client.get(`verify:${key}`);
        return Boolean(data);
    } catch (error) {
        console.error('Redis GET verification flag error:', error);
        return false;
    }
};

const deleteVerificationFlag = async (key) => {
    try {
        const client = getRedisClient();
        if (!client) {
            memoryVerifyStore.delete(String(key));
            return true;
        }
        await client.del(`verify:${key}`);
        return true;
    } catch (error) {
        console.error('Redis DEL verification flag error:', error);
        return false;
    }
};

// Rate limiting
const checkRateLimit = async (identifier, maxRequests = 5, windowInSeconds = 60) => {
    try {
        const client = getRedisClient();
        if (!client) return { allowed: true, remaining: maxRequests };

        const key = `ratelimit:${identifier}`;
        const current = await client.incr(key);

        if (current === 1) {
            await client.expire(key, windowInSeconds);
        }

        const ttl = await client.ttl(key);
        const remaining = Math.max(0, maxRequests - current);

        return {
            allowed: current <= maxRequests,
            remaining,
            resetIn: ttl,
        };
    } catch (error) {
        console.error('Redis rate limit error:', error);
        return { allowed: true, remaining: maxRequests };
    }
};

// College data caching
const cacheCollegeData = async (collegeId, data, expiryInSeconds = 3600) => {
    return await cacheSet(`college:${collegeId}`, data, expiryInSeconds);
};

const getCachedCollegeData = async (collegeId) => {
    return await cacheGet(`college:${collegeId}`);
};

const invalidateCollegeCache = async (collegeId) => {
    return await cacheDel(`college:${collegeId}`);
};

// User data caching
const cacheUserData = async (userId, data, expiryInSeconds = 1800) => {
    return await cacheSet(`user:${userId}`, data, expiryInSeconds);
};

const getCachedUserData = async (userId) => {
    return await cacheGet(`user:${userId}`);
};

const invalidateUserCache = async (userId) => {
    return await cacheDel(`user:${userId}`);
};

// Graceful shutdown
const closeRedis = async () => {
    try {
        if (!redisClient) return;

        // node-redis exposes isOpen/isReady; avoid QUIT on a closed client.
        if (redisClient.isOpen === false) {
            redisClient = null;
            isRedisConnected = false;
            return;
        }

        await redisClient.quit();
        if (process.env.NODE_ENV !== 'test') {
            console.log('✓ Redis connection closed');
        }
    } catch (error) {
        // Swallow shutdown errors (e.g. ClientClosedError) to avoid unhandled rejections.
        if (process.env.NODE_ENV !== 'test') {
            console.warn('Redis close error:', error?.message || error);
        }
    } finally {
        redisClient = null;
        isRedisConnected = false;
    }
};

module.exports = {
    initRedis,
    getRedisClient,
    cacheGet,
    cacheSet,
    cacheDel,
    cacheDelPattern,
    setSession,
    getSession,
    deleteSession,
    setOTP,
    getOTP,
    incrementOTPAttempts,
    deleteOTP,
    setVerificationFlag,
    getVerificationFlag,
    deleteVerificationFlag,
    checkRateLimit,
    cacheCollegeData,
    getCachedCollegeData,
    invalidateCollegeCache,
    cacheUserData,
    getCachedUserData,
    invalidateUserCache,
    closeRedis,
    isRedisConnected: () => isRedisConnected,
};
