const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// This script helps you test DIRECT connection vs POOLER connection

async function checkBothConnections() {
  console.log('\n🔍 TESTING POOLER vs DIRECT CONNECTION\n');
  console.log('='.repeat(70));
  
  const currentUrl = process.env.DATABASE_URL;
  console.log('Current DATABASE_URL:', currentUrl);
  
  // Check if using pooler
  const isPooler = currentUrl.includes('-pooler');
  
  if (isPooler) {
    console.log('\n⚠️  You are currently using POOLER endpoint');
    console.log('   This is fine for production, but can cause dashboard sync delays');
    
    // Generate direct URL
    const directUrl = currentUrl.replace('-pooler', '');
    console.log('\n💡 Your DIRECT connection URL would be:');
    console.log(directUrl);
    
    console.log('\n📝 TO TEST DIRECT CONNECTION:');
    console.log('1. Temporarily change DATABASE_URL in .env to the direct URL above');
    console.log('2. Run: node verify-neon-connection.js');
    console.log('3. Check if data appears in Neon dashboard immediately');
    
    console.log('\n📊 POOLER vs DIRECT:');
    console.log('┌─────────────────┬──────────────────┬──────────────────┐');
    console.log('│ Feature         │ Pooler           │ Direct           │');
    console.log('├─────────────────┼──────────────────┼──────────────────┤');
    console.log('│ Speed           │ Faster           │ Normal           │');
    console.log('│ Connections     │ Pooled           │ Direct           │');
    console.log('│ Serverless      │ Better           │ Good             │');
    console.log('│ Dashboard Sync  │ May delay        │ Immediate        │');
    console.log('│ Development     │ Good             │ Better           │');
    console.log('└─────────────────┴──────────────────┴──────────────────┘');
    
  } else {
    console.log('\n✅ You are using DIRECT connection');
    console.log('   Data should appear immediately in Neon dashboard');
  }
  
  // Test current connection
  console.log('\n📋 Testing Current Connection...');
  console.log('-'.repeat(70));
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected successfully');
    
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    if (userCount > 0) {
      const recentUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      console.log('\nMost recent user:');
      console.log('  Name:', recentUser.name);
      console.log('  Email:', recentUser.email);
      console.log('  Created:', recentUser.createdAt.toISOString());
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Go to Neon dashboard: https://console.neon.tech');
    console.log('2. Click on "SQL Editor"');
    console.log('3. Run this query:');
    console.log('   SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 5;');
    console.log('4. You should see your data there!');
    
    if (isPooler) {
      console.log('\n⚠️  If you still don\'t see data in dashboard:');
      console.log('   - Wait 30-60 seconds and refresh');
      console.log('   - Or switch to direct connection URL (see above)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
}

checkBothConnections();
