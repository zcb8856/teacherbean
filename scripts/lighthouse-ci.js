#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

/**
 * Lighthouse CI Script for Continuous Integration
 * Optimized for CI environments with stricter thresholds
 */

const ciConfig = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36',
  }
};

// CI-specific thresholds (slightly more lenient for CI environment)
const ciThresholds = {
  performance: 85,      // Slightly lower for CI
  accessibility: 95,    // Keep high for accessibility
  'best-practices': 90, // Keep high for best practices
  seo: 90,             // Keep high for SEO

  // Core Web Vitals (CI-adjusted)
  'largest-contentful-paint': 3000,  // +500ms for CI
  'first-input-delay': 150,          // +50ms for CI
  'cumulative-layout-shift': 0.15,   // +0.05 for CI
  'first-contentful-paint': 2200,    // +400ms for CI
  'speed-index': 3500,               // +500ms for CI
  'time-to-interactive': 4000        // +500ms for CI
};

// Critical pages for CI testing
const criticalUrls = [
  process.env.LIGHTHOUSE_URL || 'http://localhost:3000',
  `${process.env.LIGHTHOUSE_URL || 'http://localhost:3000'}/plan`,
  `${process.env.LIGHTHOUSE_URL || 'http://localhost:3000'}/writing`
];

async function launchChromeAndRunLighthouse(url, opts = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });

  opts.port = chrome.port;

  try {
    const runnerResult = await lighthouse(url, opts, ciConfig);
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

function checkCIThresholds(lhr) {
  const failures = [];
  const warnings = [];

  // Check category scores
  ['performance', 'accessibility', 'best-practices', 'seo'].forEach(category => {
    const score = lhr.categories[category]?.score;
    const threshold = ciThresholds[category];

    if (score !== null) {
      const scoreValue = formatScore(score);
      if (scoreValue < threshold) {
        failures.push(`${category}: ${scoreValue} < ${threshold}`);
      } else if (scoreValue < threshold + 5) {
        warnings.push(`${category}: ${scoreValue} (close to threshold ${threshold})`);
      }
    }
  });

  // Check Core Web Vitals
  const cwvChecks = {
    'largest-contentful-paint': lhr.audits['largest-contentful-paint']?.numericValue,
    'first-input-delay': lhr.audits['max-potential-fid']?.numericValue,
    'cumulative-layout-shift': lhr.audits['cumulative-layout-shift']?.numericValue,
    'first-contentful-paint': lhr.audits['first-contentful-paint']?.numericValue,
    'speed-index': lhr.audits['speed-index']?.numericValue,
    'time-to-interactive': lhr.audits['interactive']?.numericValue
  };

  Object.entries(cwvChecks).forEach(([metric, value]) => {
    const threshold = ciThresholds[metric];
    if (value !== null && value !== undefined && value > threshold) {
      failures.push(`${metric}: ${value.toFixed(0)}ms > ${threshold}ms`);
    }
  });

  return { failures, warnings };
}

async function runCIAudit() {
  console.log('🤖 Lighthouse CI Audit');
  console.log('======================\n');

  let totalFailures = 0;
  let totalWarnings = 0;
  const results = [];

  try {
    for (const url of criticalUrls) {
      console.log(`🔍 Auditing: ${url}`);

      const result = await launchChromeAndRunLighthouse(url, {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      });

      const lhr = result.lhr;
      const { failures, warnings } = checkCIThresholds(lhr);

      const urlResult = {
        url,
        scores: {
          performance: formatScore(lhr.categories.performance?.score),
          accessibility: formatScore(lhr.categories.accessibility?.score),
          bestPractices: formatScore(lhr.categories['best-practices']?.score),
          seo: formatScore(lhr.categories.seo?.score)
        },
        failures,
        warnings,
        passed: failures.length === 0
      };

      results.push(urlResult);
      totalFailures += failures.length;
      totalWarnings += warnings.length;

      // Output results
      console.log(`  Performance: ${urlResult.scores.performance} (threshold: ≥${ciThresholds.performance})`);
      console.log(`  Accessibility: ${urlResult.scores.accessibility} (threshold: ≥${ciThresholds.accessibility})`);
      console.log(`  Best Practices: ${urlResult.scores.bestPractices} (threshold: ≥${ciThresholds['best-practices']})`);
      console.log(`  SEO: ${urlResult.scores.seo} (threshold: ≥${ciThresholds.seo})`);

      if (failures.length > 0) {
        console.log(`  ❌ FAILURES (${failures.length}):`);
        failures.forEach(failure => console.log(`     ${failure}`));
      }

      if (warnings.length > 0) {
        console.log(`  ⚠️  WARNINGS (${warnings.length}):`);
        warnings.forEach(warning => console.log(`     ${warning}`));
      }

      if (failures.length === 0) {
        console.log(`  ✅ PASSED`);
      }

      console.log('');
    }

    // Save CI results
    const ciReport = {
      timestamp: new Date().toISOString(),
      environment: 'CI',
      thresholds: ciThresholds,
      summary: {
        totalUrls: criticalUrls.length,
        totalFailures,
        totalWarnings,
        passed: totalFailures === 0
      },
      results
    };

    const outputDir = path.join(process.cwd(), 'lighthouse-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(outputDir, `lighthouse-ci-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(ciReport, null, 2));

    console.log('📊 CI AUDIT SUMMARY');
    console.log('==================');
    console.log(`URLs tested: ${criticalUrls.length}`);
    console.log(`Total failures: ${totalFailures}`);
    console.log(`Total warnings: ${totalWarnings}`);
    console.log(`Report saved: ${reportPath}`);

    if (totalFailures === 0) {
      console.log('🎉 All CI audits PASSED!');
      process.exit(0);
    } else {
      console.log('💥 CI audits FAILED - performance/accessibility thresholds not met');

      // Output failure summary for CI logs
      console.log('\nFAILURE DETAILS:');
      results.forEach(result => {
        if (result.failures.length > 0) {
          console.log(`\n${result.url}:`);
          result.failures.forEach(failure => console.log(`  - ${failure}`));
        }
      });

      process.exit(1);
    }

  } catch (error) {
    console.error('❌ CI Lighthouse audit failed:', error.message);
    process.exit(1);
  }
}

// Environment checks
if (process.env.CI) {
  console.log('🤖 Running in CI environment');
} else {
  console.log('⚠️  Not in CI environment - consider using pnpm audit:lighthouse for local development');
}

if (!process.env.LIGHTHOUSE_URL && !criticalUrls[0].includes('localhost')) {
  console.error('❌ LIGHTHOUSE_URL environment variable not set for CI');
  process.exit(1);
}

runCIAudit();