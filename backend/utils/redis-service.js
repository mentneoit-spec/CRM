const redis = require('redis');

// Redis client configuration
let redisClient = null;
let isRedisConnected = false;

// Initialize Redis client
const initRedis = async () => {
    try {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
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
        if (!client) return false;

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
        if (!client) return null;

        const data = await client.get(`otp:${phone}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis GET OTP error:', error);
        return null;
    }
};

const incrementOTPAttempts = async (phone) => {
    try {
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
    return await cacheDel(`otp:${phone}`);
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
        if (redisClient) {
            await redisClient.quit();
            console.log('✓ Redis connection closed');
        }
    } catch (error) {
        console.error('Redis close error:', error);
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
