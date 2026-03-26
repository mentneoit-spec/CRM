const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function fixRDSConnection() {
    console.log('🔧 Fixing RDS Connection String\n');
    
    console.log('❌ Current issue: Missing database name in connection string');
    console.log('📡 Current: postgresql://gvs-crm-db:****@gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com:5432/');
    console.log('✅ Should be: postgresql://gvs-crm-db:****@gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com:5432/DATABASE_NAME\n');

    try {
        // Get database name
        const dbName = await askQuestion('🗄️ What is your RDS database name? (e.g., crm, postgres, college_db): ');
        
        if (!dbName.trim()) {
            console.log('❌ Database name is required!');
            rl.close();
            return;
        }

        // Construct new connection string
        const newConnectionString = `postgresql://gvs-crm-db:CrmProject2026!@gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com:5432/${dbName.trim()}`;

        console.log('\n📝 New RDS Connection String:');
        console.log(`   ${newConnectionString.replace(/:[^:@]*@/, ':****@')}\n`);

        // Ask for confirmation
        const confirm = await askQuestion('✅ Update .env file with this connection string? (y/n): ');
        
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            console.log('❌ Update cancelled.');
            rl.close();
            return;
        }

        // Update .env file
        const envPath = path.join(__dirname, '.env');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Update RDS_DATABASE_URL
        if (envContent.includes('RDS_DATABASE_URL=')) {
            envContent = envContent.replace(/RDS_DATABASE_URL=.*/, `RDS_DATABASE_URL="${newConnectionString}"`);
        } else {
            envContent += `\n# ==================== AWS RDS ====================\nRDS_DATABASE_URL="${newConnectionString}"\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env file with corrected RDS connection string\n');

        // Test connection
        const testNow = await askQuestion('🔍 Test RDS connection now? (y/n): ');
        
        if (testNow.toLowerCase() === 'y' || testNow.toLowerCase() === 'yes') {
            console.log('\n🔄 Testing connection...\n');
            rl.close();
            
            // Test connection
            const { spawn } = require('child_process');
            const testProcess = spawn('node', ['test-rds-connection.js'], { stdio: 'inherit' });
            
            testProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('\n🎉 Connection test completed!');
                } else {
                    console.log('\n❌ Connection test failed. Please check:');
                    console.log('1. RDS instance is running');
                    console.log('2. Security group allows your IP');
                    console.log('3. Database exists');
                    console.log('4. Credentials are correct');
                }
            });
        } else {
            console.log('\n📋 To test connection later, run:');
            console.log('   node test-rds-connection.js\n');
            console.log('📖 For migration, run:');
            console.log('   node migrate-neon-to-rds.js');
            rl.close();
        }

    } catch (error) {
        console.error('❌ Error:', error);
        rl.close();
    }
}

fixRDSConnection();