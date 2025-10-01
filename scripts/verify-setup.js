#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all performance and accessibility tools are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Performance & Accessibility Setup');
console.log('==============================================\n');

const checks = [];

// Check if required scripts exist
const requiredScripts = [
  'scripts/lighthouse-audit.js',
  'scripts/lighthouse-ci.js',
  'scripts/accessibility-check.js'
];

requiredScripts.forEach(script => {
  const exists = fs.existsSync(path.join(process.cwd(), script));
  checks.push({
    name: `Script: ${script}`,
    status: exists ? 'PASS' : 'FAIL',
    details: exists ? 'Found' : 'Missing'
  });
});

// Check package.json for required scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredNpmScripts = [
  'audit:lighthouse',
  'audit:lighthouse:ci',
  'accessibility:check',
  'perf:lighthouse-dev'
];

requiredNpmScripts.forEach(scriptName => {
  const exists = packageJson.scripts[scriptName];
  checks.push({
    name: `NPM Script: ${scriptName}`,
    status: exists ? 'PASS' : 'FAIL',
    details: exists ? exists : 'Missing from package.json'
  });
});

// Check for required dependencies
const requiredDevDeps = [
  'lighthouse',
  'chrome-launcher',
  'concurrently',
  'wait-on',
  'cross-env'
];

requiredDevDeps.forEach(dep => {
  const exists = packageJson.devDependencies[dep];
  checks.push({
    name: `Dependency: ${dep}`,
    status: exists ? 'PASS' : 'FAIL',
    details: exists ? `v${exists}` : 'Missing from devDependencies'
  });
});

// Check GitHub Actions workflow
const workflowPath = '.github/workflows/lighthouse-ci.yml';
const workflowExists = fs.existsSync(workflowPath);
checks.push({
  name: 'GitHub Actions Workflow',
  status: workflowExists ? 'PASS' : 'FAIL',
  details: workflowExists ? 'CI workflow configured' : 'Workflow file missing'
});

// Check gitignore for lighthouse reports
const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
const hasLighthouseIgnore = gitignoreContent.includes('lighthouse-reports');
checks.push({
  name: 'Gitignore Configuration',
  status: hasLighthouseIgnore ? 'PASS' : 'FAIL',
  details: hasLighthouseIgnore ? 'Lighthouse reports ignored' : 'Add /lighthouse-reports/ to .gitignore'
});

// Display results
console.log('📊 Setup Verification Results');
console.log('=============================\n');

const passed = checks.filter(c => c.status === 'PASS').length;
const total = checks.length;

checks.forEach(check => {
  const icon = check.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  if (check.details) {
    console.log(`   ${check.details}`);
  }
  console.log('');
});

console.log(`\n📈 Summary: ${passed}/${total} checks passed`);

if (passed === total) {
  console.log('🎉 All setup checks passed! You can now run:');
  console.log('   • pnpm install (to install dependencies)');
  console.log('   • pnpm audit:lighthouse (for performance audits)');
  console.log('   • pnpm accessibility:check (for accessibility audits)');
} else {
  console.log('⚠️  Some setup checks failed. Please review the issues above.');
  console.log('\n🔧 To fix missing dependencies, run:');
  console.log('   pnpm install');
}

console.log('\n📋 Performance & Accessibility Standards:');
console.log('==========================================');
console.log('• LCP < 2.5s (cold start)');
console.log('• Form interactions < 200ms');
console.log('• Color contrast ≥ 4.5:1 (normal text)');
console.log('• All form controls have labels');
console.log('• Keyboard navigation support');
console.log('• Mobile responsive (≥375px width)');
console.log('• Touch targets ≥44px');

process.exit(passed === total ? 0 : 1);