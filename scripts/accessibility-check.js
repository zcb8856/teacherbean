#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Accessibility Check Script
 * Focuses specifically on WCAG AA compliance and form accessibility
 */

const accessibilityConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['accessibility'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    }
  },
  audits: [
    // WCAG AA Color Contrast
    'color-contrast',

    // Form Accessibility
    'label',
    'form-field-multiple-labels',
    'aria-required-attr',
    'aria-valid-attr',
    'aria-errormessage-attr',
    'aria-input-field-name',

    // Keyboard Navigation
    'focusable-controls',
    'focus-traps',
    'interactive-element-affordance',
    'managed-focus',
    'tabindex',

    // Semantic HTML
    'heading-order',
    'html-has-lang',
    'html-lang-valid',
    'meta-viewport',
    'button-name',
    'link-name',
    'image-alt',
    'input-image-alt',

    // ARIA
    'aria-allowed-attr',
    'aria-hidden-body',
    'aria-hidden-focus',
    'aria-required-children',
    'aria-required-parent',
    'aria-roles',
    'aria-valid-attr-value',
    'duplicate-id-aria',
    'list',
    'listitem',
    'definition-list',
    'dlitem'
  ]
};

// WCAG AA Requirements
const wcagChecks = {
  colorContrast: {
    normalText: 4.5,
    largeText: 3.0
  },
  formRequirements: [
    'All form controls have associated labels',
    'Error messages use aria-errormessage',
    'Required fields marked with aria-required',
    'Form validation provides clear feedback'
  ],
  keyboardRequirements: [
    'All interactive elements keyboard accessible',
    'Logical tab order maintained',
    'Focus indicators visible',
    'Skip links for main content'
  ],
  mobileRequirements: [
    'Touch targets ≥ 44px',
    'Content reflows without horizontal scroll',
    'Text scales appropriately for mobile'
  ]
};

// URLs with forms and interactive elements
const accessibilityUrls = [
  'http://localhost:3000',
  'http://localhost:3000/plan',
  'http://localhost:3000/writing',
  'http://localhost:3000/assess',
  'http://localhost:3000/library'
];

async function launchChromeAndRunLighthouse(url, opts = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions'
    ]
  });

  opts.port = chrome.port;

  try {
    const runnerResult = await lighthouse(url, opts, accessibilityConfig);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function formatScore(score) {
  if (score === null) return 'N/A';
  return Math.round(score * 100);
}

function analyzeAccessibilityAudits(lhr) {
  const auditResults = lhr.audits;
  const issues = [];
  const recommendations = [];

  // Critical accessibility failures
  const criticalAudits = [
    'color-contrast',
    'label',
    'aria-required-attr',
    'button-name',
    'link-name',
    'image-alt',
    'html-has-lang',
    'focusable-controls'
  ];

  criticalAudits.forEach(auditId => {
    const audit = auditResults[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      issues.push({
        type: 'critical',
        audit: auditId,
        title: audit.title,
        description: audit.description,
        score: formatScore(audit.score),
        details: audit.details
      });
    }
  });

  // Form-specific checks
  const formAudits = [
    'label',
    'form-field-multiple-labels',
    'aria-required-attr',
    'aria-errormessage-attr'
  ];

  formAudits.forEach(auditId => {
    const audit = auditResults[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      issues.push({
        type: 'form',
        audit: auditId,
        title: audit.title,
        description: audit.description,
        score: formatScore(audit.score),
        impact: 'Form accessibility compromised'
      });
    }
  });

  // Color contrast analysis
  const colorContrast = auditResults['color-contrast'];
  if (colorContrast && colorContrast.score !== null && colorContrast.score < 1) {
    const contrastDetails = colorContrast.details?.items || [];
    contrastDetails.forEach(item => {
      issues.push({
        type: 'contrast',
        element: item.node?.snippet || 'Unknown element',
        ratio: item.contrastRatio,
        expected: item.expectedContrastRatio,
        impact: 'Text may be difficult to read'
      });
    });
  }

  // Generate recommendations
  if (issues.filter(i => i.type === 'form').length > 0) {
    recommendations.push('Review form controls to ensure all have proper labels and ARIA attributes');
  }

  if (issues.filter(i => i.type === 'contrast').length > 0) {
    recommendations.push('Adjust color schemes to meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)');
  }

  if (issues.filter(i => i.type === 'critical').length > 0) {
    recommendations.push('Address critical accessibility issues that prevent users with disabilities from accessing content');
  }

  return { issues, recommendations };
}

async function runAccessibilityCheck() {
  console.log('♿ Comprehensive Accessibility Check');
  console.log('===================================\n');

  const allResults = [];
  let totalIssues = 0;

  try {
    for (const url of accessibilityUrls) {
      console.log(`🔍 Checking accessibility: ${url}`);

      const result = await launchChromeAndRunLighthouse(url);
      const lhr = result.lhr;
      const accessibilityScore = formatScore(lhr.categories.accessibility?.score);

      const { issues, recommendations } = analyzeAccessibilityAudits(lhr);

      allResults.push({
        url,
        score: accessibilityScore,
        issues,
        recommendations
      });

      totalIssues += issues.length;

      console.log(`  Accessibility Score: ${accessibilityScore}/100`);
      console.log(`  Issues Found: ${issues.length}`);

      if (issues.length > 0) {
        console.log(`  Issue Breakdown:`);
        const criticalIssues = issues.filter(i => i.type === 'critical').length;
        const formIssues = issues.filter(i => i.type === 'form').length;
        const contrastIssues = issues.filter(i => i.type === 'contrast').length;

        if (criticalIssues > 0) console.log(`    🔴 Critical: ${criticalIssues}`);
        if (formIssues > 0) console.log(`    📝 Form: ${formIssues}`);
        if (contrastIssues > 0) console.log(`    🎨 Contrast: ${contrastIssues}`);
      } else {
        console.log(`  ✅ No accessibility issues found`);
      }

      console.log('');
    }

    // Generate comprehensive report
    console.log('📊 ACCESSIBILITY SUMMARY');
    console.log('========================');

    const avgScore = Math.round(
      allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
    );

    console.log(`Average Accessibility Score: ${avgScore}/100 (target: ≥95)`);
    console.log(`Total Issues Found: ${totalIssues}`);

    // WCAG AA Compliance Check
    console.log('\n📋 WCAG AA Compliance Checklist');
    console.log('===============================');

    const hasFormIssues = allResults.some(r => r.issues.some(i => i.type === 'form'));
    const hasContrastIssues = allResults.some(r => r.issues.some(i => i.type === 'contrast'));
    const hasCriticalIssues = allResults.some(r => r.issues.some(i => i.type === 'critical'));

    console.log(`${hasFormIssues ? '❌' : '✅'} Form Controls & Labels`);
    console.log(`${hasContrastIssues ? '❌' : '✅'} Color Contrast (WCAG AA)`);
    console.log(`${hasCriticalIssues ? '❌' : '✅'} Critical Accessibility Requirements`);

    // Mobile accessibility note
    console.log('\n📱 Mobile Accessibility');
    console.log('======================');
    console.log('⚠️  Run mobile-specific tests with: pnpm test:mobile');
    console.log('   • Touch target sizes (≥44px)');
    console.log('   • Content reflow on 375px width');
    console.log('   • Text scaling compatibility');

    // Save detailed report
    const outputDir = path.join(process.cwd(), 'lighthouse-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(outputDir, `accessibility-report-${timestamp}.json`);

    const accessibilityReport = {
      timestamp: new Date().toISOString(),
      type: 'accessibility-audit',
      wcagLevel: 'AA',
      summary: {
        totalUrls: accessibilityUrls.length,
        averageScore: avgScore,
        totalIssues,
        compliance: {
          forms: !hasFormIssues,
          contrast: !hasContrastIssues,
          critical: !hasCriticalIssues
        }
      },
      requirements: wcagChecks,
      results: allResults
    };

    fs.writeFileSync(reportPath, JSON.stringify(accessibilityReport, null, 2));

    console.log(`\n📁 Detailed report saved: ${reportPath}`);

    // Recommendations
    if (totalIssues > 0) {
      console.log('\n🔧 RECOMMENDATIONS');
      console.log('==================');

      const allRecommendations = [...new Set(
        allResults.flatMap(r => r.recommendations)
      )];

      allRecommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });

      console.log('\n📚 WCAG AA Resources:');
      console.log('  • https://www.w3.org/WAI/WCAG21/quickref/');
      console.log('  • https://webaim.org/resources/contrastchecker/');
      console.log('  • https://www.w3.org/WAI/ARIA/apg/');
    }

    // Exit with appropriate code
    if (avgScore < 95 || totalIssues > 0) {
      console.log('\n⚠️  Accessibility issues found - review and fix before production');
      process.exit(1);
    } else {
      console.log('\n🎉 All accessibility checks passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Accessibility check failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
console.log('⚠️  Make sure your development server is running (pnpm dev)\n');

runAccessibilityCheck();