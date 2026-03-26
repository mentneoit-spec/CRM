const { PrismaClient } = require('@prisma/client');

async function testRDSConnection() {
    const rdsUrl = process.env.RDS_DATABASE_URL;
    
    if (!rdsUrl) {
        console.log('❌ RDS_DATABASE_URL not found in environment variables');
        console.log('💡 Please set it using:');
        console.log('   export RDS_DATABASE_URL="postgresql://username:password@host:5432/database"');
        console.log('   OR add it to your .env file');
        return;
    }

    console.log('🔍 Testing RDS Connection...');
    console.log(`📡 Connecting to: ${rdsUrl.replace(/:[^:@]*@/, ':****@')}\n`);

    const rdsPrisma = new PrismaClient({
        datasources: {
            db: {
                url: rdsUrl
            }
        }
    });

    try {
        // Test connection
        await rdsPrisma.$connect();
        console.log('✅ Successfully connected to AWS RDS!\n');

        // Test basic operations
        console.log('🔧 Testing database operations...');
        
        // Try to query system tables
        const result = await rdsPrisma.$queryRaw`SELECT version()`;
        console.log('✅ Database query successful');
        console.log(`📊 PostgreSQL Version: ${result[0].version}\n`);

        // Check if tables exist
        const tables = await rdsPrisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        console.log(`📋 Existing tables in RDS: ${tables.length}`);
        if (tables.length > 0) {
            console.log('   Tables found:');
            tables.forEach(table => {
                console.log(`   • ${table.table_name}`);
            });
        } else {
            console.log('   No tables found (fresh database)');
        }

        console.log('\n🎉 RDS connection test successful!');
        console.log('✅ Ready for migration');

    } catch (error) {
        console.error('❌ RDS connection failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check your RDS endpoint and credentials');
        console.log('2. Ensure RDS security group allows your IP');
        console.log('3. Verify the database exists');
        console.log('4. Check if RDS instance is running');
    } finally {
        await rdsPrisma.$disconnect();
    }
}

testRDSConnection();