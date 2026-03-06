const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Frontend Files...\n');

const requiredFiles = [
  'src/App.js',
  'src/index.js',
  'src/theme/theme.js',
  'src/config/api.js',
  'src/pages/LandingPage.js',
  'src/pages/ModernLogin.js',
  'src/pages/ModernSignup.js',
  'src/pages/ModernAdmissionPortal.js',
  'src/pages/ConnectionTest.js',
  'src/pages/ParentSignup.js',
  'src/pages/AdminSignup.js',
  'src/pages/superadmin/SuperAdminDashboard.js',
  'src/pages/superadmin/CollegesList.js',
  'src/pages/admin/AdminDashboardModern.js',
  'src/pages/admin/AdminTeachers.js',
  'src/pages/admin/AdminStudents.js',
  'src/pages/admin/AdminClasses.js',
  'src/pages/admin/AdminAdmissions.js',
  'src/pages/admin/AdminFees.js',
  'src/pages/admin/AdminSubjects.js',
  'src/pages/admin/TeamManagement.js',
  'src/pages/admin/AdminTransport.js',
  'src/pages/student/StudentDashboardModern.js',
  'src/pages/teacher/TeacherDashboardModern.js',
  'src/pages/parent/ParentDashboardModern.js',
  'src/components/common/DataTable.js',
  'src/components/common/FormDialog.js',
];

let missingFiles = [];
let existingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Summary:`);
console.log(`✅ Existing: ${existingFiles.length}/${requiredFiles.length}`);
console.log(`❌ Missing: ${missingFiles.length}/${requiredFiles.length}`);

if (missingFiles.length > 0) {
  console.log(`\n⚠️  Missing Files:`);
  missingFiles.forEach(file => console.log(`   - ${file}`));
  console.log(`\n💡 These files need to be created.`);
} else {
  console.log(`\n🎉 All required files exist!`);
}

// Check package.json
console.log(`\n📦 Checking package.json...`);
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`✅ package.json exists`);
  console.log(`   Name: ${pkg.name}`);
  console.log(`   Version: ${pkg.version}`);
  
  // Check key dependencies
  const requiredDeps = ['react', 'react-dom', '@mui/material', 'axios', 'react-router-dom'];
  console.log(`\n📚 Checking dependencies...`);
  requiredDeps.forEach(dep => {
    if (pkg.dependencies[dep]) {
      console.log(`✅ ${dep}: ${pkg.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: MISSING`);
    }
  });
} else {
  console.log(`❌ package.json not found`);
}

// Check node_modules
console.log(`\n📁 Checking node_modules...`);
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log(`✅ node_modules exists`);
} else {
  console.log(`❌ node_modules not found - Run: npm install`);
}

// Check .env
console.log(`\n🔐 Checking .env...`);
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`✅ .env exists`);
  if (envContent.includes('REACT_APP_API_URL')) {
    console.log(`✅ REACT_APP_API_URL is configured`);
  } else {
    console.log(`⚠️  REACT_APP_API_URL not found in .env`);
  }
} else {
  console.log(`⚠️  .env not found (optional)`);
}

console.log(`\n${'='.repeat(60)}\n`);
