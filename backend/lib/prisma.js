// Singleton Prisma Client - Use this in ALL files instead of creating new instances
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // In development, use a global variable to avoid exhausting database connection
    // when Hot Reload creates multiple instances
    if (!global.prisma) {
        global.prisma = new PrismaClient({
            log: ['warn', 'error'], // Only log warnings and errors in development
        });
    }
    prisma = global.prisma;
}

module.exports = prisma;
