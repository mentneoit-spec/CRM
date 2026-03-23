const { Client } = require('pg');
require('dotenv').config();

// This script uses raw PostgreSQL client to test the connection
// This bypasses Prisma entirely to verify the database itself

async function testDirectConnection() {
  console.log('\n🔍 TESTING RAW POSTGRESQL CONNECTION (No Prisma)\n');
  console.log('='.repeat(70));
  
  const connectionString = process.env.DATABASE_URL;
  console.log('Connection String:', connectionString);
  
  const client = new Client({
    connectionString: connectionString,
  });
  
  try {
    console.log('\n📋 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Get database info
    console.log('\n📋 Database Information:');
    console.log('-'.repeat(70));
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    `);
    console.log('Database:', dbInfo.rows[0].database);
    console.log('User:', dbInfo.rows[0].user);
    console.log('Version:', dbInfo.rows[0].version.split(',')[0]);
    
    // Check if User table exists
    console.log('\n📋 Checking if User table exists:');
    console.log('-'.repeat(70));
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      );
    `);
    const tableExists = tableCheck.rows[0].exists;
    console.log('User table exists:', tableExists ? 'YES ✅' : 'NO ❌');
    
    if (tableExists) {
      // Count users
      console.log('\n📋 Counting users:');
      console.log('-'.repeat(70));
      const countResult = await client.query('SELECT COUNT(*) FROM "User"');
      const userCount = parseInt(countResult.rows[0].count);
      console.log('Total users:', userCount);
      
      if (userCount > 0) {
        // Show recent users
        console.log('\n📋 Recent users:');
        console.log('-'.repeat(70));
        const usersResult = await client.query(`
          SELECT id, name, email, role, "createdAt" 
          FROM "User" 
          ORDER BY "createdAt" DESC 
          LIMIT 5
        `);
        
        usersResult.rows.forEach((user, index) => {
          console.log(`\n${index + 1}. ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Created: ${user.createdAt.toISOString()}`);
        });
      }
      
      // Insert test record
      console.log('\n📋 Inserting test record:');
      console.log('-'.repeat(70));
      const testEmail = `direct-test-${Date.now()}@verify.com`;
      const insertResult = await client.query(`
        INSERT INTO "User" (id, name, email, password, role, "isActive", "isEmailVerified", "isPhoneVerified", "twoFAEnabled", "isDeleted", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Direct Test User', $1, 'test-hash', 'Admin', true, false, false, false, false, NOW(), NOW())
        RETURNING id, name, email, "createdAt"
      `, [testEmail]);
      
      const newUser = insertResult.rows[0];
      console.log('✅ Test user inserted!');
      console.log('   ID:', newUser.id);
      console.log('   Name:', newUser.name);
      console.log('   Email:', newUser.email);
      console.log('   Created:', newUser.createdAt.toISOString());
      
      // Verify it was inserted
      console.log('\n📋 Verifying insertion:');
      console.log('-'.repeat(70));
      const verifyResult = await client.query(
        'SELECT * FROM "User" WHERE id = $1',
        [newUser.id]
      );
      
      if (verifyResult.rows.length > 0) {
        console.log('✅ Verification successful! User found in database.');
      } else {
        console.log('❌ ERROR: User not found after insertion!');
      }
      
      // Final count
      const finalCount = await client.query('SELECT COUNT(*) FROM "User"');
      console.log('\n📋 Final user count:', finalCount.rows[0].count);
      
    } else {
      console.log('\n❌ User table does not exist!');
      console.log('💡 Run: npx prisma db push');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Direct connection test complete!');
    console.log('\n💡 This test used raw PostgreSQL (no Prisma)');
    console.log('   If this works, your database connection is fine.');
    console.log('   Data should be visible in Neon dashboard.\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Code:', error.code);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
    console.log('Disconnected from database\n');
  }
}

testDirectConnection();
