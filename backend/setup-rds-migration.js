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

async function setupRDSMigration() {
    console.log('🚀 AWS RDS Migration Setup\n');
    console.log('📊 Your Neon database contains:');
    console.log('   • 7 Colleges');
    console.log('   • 109 Users');
    console.log('   • 61 Students');
    console.log('   • 21 Teachers');
    console.log('   • 27 Classes');
    console.log('   • 56 Subjects');
    console.log('   • 158 Exams');
    console.log('   • 1,716 Exam Results');
    console.log('   • 166 Fees');
    console.log('   • 24 Payments');
    console.log('   • 6 Admissions');
    console.log('   📈 Total: 2,351 records\n');

    console.log('To migrate this data to AWS RDS, I need your RDS connection details:\n');

    try {
        // Get RDS connection details
        const rdsHost = await askQuestion('🔗 RDS Endpoint (e.g., mydb.cluster-xyz.us-east-1.rds.amazonaws.com): ');
        const rdsPort = await askQuestion('🔌 RDS Port (default 5432): ') || '5432';
        const rdsDatabase = await askQuestion('🗄️ Database Name: ');
        const rdsUsername = await askQuestion('👤 Username: ');
        const rdsPassword = await askQuestion('🔐 Password: ');

        // Construct connection string
        const rdsConnectionString = `postgresql://${rdsUsername}:${rdsPassword}@${rdsHost}:${rdsPort}/${rdsDatabase}`;

        console.log('\n📝 Generated RDS Connection String:');
        console.log(`   ${rdsConnectionString}\n`);

        // Ask for confirmation
        const confirm = await askQuestion('✅ Does this look correct? (y/n): ');
        
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            console.log('❌ Setup cancelled. Please run again with correct details.');
            rl.close();
            return;
        }

        // Update .env file
        const envPath = path.join(__dirname, '.env');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Add RDS_DATABASE_URL
        if (envContent.includes('RDS_DATABASE_URL=')) {
            envContent = envContent.replace(/RDS_DATABASE_URL=.*/, `RDS_DATABASE_URL="${rdsConnectionString}"`);
        } else {
            envContent += `\n# ==================== AWS RDS ====================\nRDS_DATABASE_URL="${rdsConnectionString}"\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env file with RDS connection string\n');

        // Ask if they want to run migration now
        const runNow = await askQuestion('🚀 Run migration now? (y/n): ');
        
        if (runNow.toLowerCase() === 'y' || runNow.toLowerCase() === 'yes') {
            console.log('\n🔄 Starting migration...\n');
            rl.close();
            
            // Run migration
            const { migrateDatabase } = require('./migrate-neon-to-rds.js');
            await migrateDatabase();
        } else {
            console.log('\n📋 To run migration later, use:');
            console.log('   node migrate-neon-to-rds.js\n');
            console.log('📖 For detailed instructions, see: MIGRATION_GUIDE.md');
            rl.close();
        }

    } catch (error) {
        console.error('❌ Setup failed:', error);
        rl.close();
    }
}

setupRDSMigration();