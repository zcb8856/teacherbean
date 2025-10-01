#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const config = {
  // Lighthouse configuration
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
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
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36',
  },
  audits: [
    'largest-contentful-paint',
    'first-input-delay',
    'cumulative-layout-shift',
    'first-contentful-paint',
    'speed-index',
    'time-to-interactive',
    'color-contrast',
    'heading-order',
    'html-has-lang',
    'label',
    'aria-required-attr',
    'button-name',
    'link-name',
    'meta-viewport',
    'image-alt',
    'form-field-multiple-labels',
    'focusable-controls',
    'interactive-element-affordance',
    'managed-focus',
  ]
};

// URLs to audit
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/plan',
  'http://localhost:3000/reading',
  'http://localhost:3000/writing',
  'http://localhost:3000/assess',
  'http://localhost:3000/library'
];

// Performance thresholds
const thresholds = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 90,
  // Core Web Vitals
  'largest-contentful-paint': 2500,
  'first-input-delay': 100,
  'cumulative-layout-shift': 0.1,
  'first-contentful-paint': 1800,
  'speed-index': 3000,
  'time-to-interactive': 3500
};

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
    const runnerResult = await lighthouse(url, opts, config);
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

function formatMetric(value, unit = 'ms') {
  if (value === null || value === undefined) return 'N/A';
  if (unit === 'ms') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
  }
  return `${value}${unit}`;
}

function checkThresholds(lhr) {
  const failures = [];

  // Check category scores
  Object.entries(thresholds).forEach(([category, threshold]) => {
    if (category.includes('-')) return; // Skip individual metrics for now

    const score = lhr.categories[category]?.score;
    if (score !== null && formatScore(score) < threshold) {
      failures.push(`${category}: ${formatScore(score)} (threshold: ${threshold})`);
    }
  });

  // Check Core Web Vitals
  const cwvChecks = {
    'largest-contentful-paint': lhr.audits['largest-contentful-paint']?.numericValue,
    'first-input-delay': lhr.audits['max-potential-fid']?.numericValue, // FID estimate
    'cumulative-layout-shift': lhr.audits['cumulative-layout-shift']?.numericValue,
    'first-contentful-paint': lhr.audits['first-contentful-paint']?.numericValue,
    'speed-index': lhr.audits['speed-index']?.numericValue,
    'time-to-interactive': lhr.audits['interactive']?.numericValue
  };

  Object.entries(cwvChecks).forEach(([metric, value]) => {
    const threshold = thresholds[metric];
    if (value !== null && value !== undefined && value > threshold) {
      failures.push(`${metric}: ${formatMetric(value)} (threshold: ${formatMetric(threshold)})`);
    }
  });

  return failures;
}

async function runAudit() {
  console.log('🔍 Running Lighthouse Performance & Accessibility Audit');
  console.log('=====================================\n');

  const allResults = [];
  const reports = [];

  try {
    for (const url of urls) {
      console.log(`📊 Auditing: ${url}`);

      const result = await launchChromeAndRunLighthouse(url, {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      });

      const lhr = result.lhr;
      allResults.push({ url, lhr });

      // Generate detailed report
      const report = {
        url,
        timestamp: new Date().toISOString(),
        scores: {
          performance: formatScore(lhr.categories.performance?.score),
          accessibility: formatScore(lhr.categories.accessibility?.score),
          bestPractices: formatScore(lhr.categories['best-practices']?.score),
          seo: formatScore(lhr.categories.seo?.score)
        },
        coreWebVitals: {
          lcp: formatMetric(lhr.audits['largest-contentful-paint']?.numericValue),
          fid: formatMetric(lhr.audits['max-potential-fid']?.numericValue),
          cls: lhr.audits['cumulative-layout-shift']?.numericValue?.toFixed(3) || 'N/A',
          fcp: formatMetric(lhr.audits['first-contentful-paint']?.numericValue),
          si: formatMetric(lhr.audits['speed-index']?.numericValue),
          tti: formatMetric(lhr.audits['interactive']?.numericValue)
        },
        failures: checkThresholds(lhr)
      };

      reports.push(report);

      // Console output
      console.log(`  ✨ Performance: ${report.scores.performance}`);
      console.log(`  ♿ Accessibility: ${report.scores.accessibility}`);
      console.log(`  🔧 Best Practices: ${report.scores.bestPractices}`);
      console.log(`  🔍 SEO: ${report.scores.seo}`);
      console.log(`  🚀 LCP: ${report.coreWebVitals.lcp}`);
      console.log(`  ⚡ FID: ${report.coreWebVitals.fid}`);
      console.log(`  📊 CLS: ${report.coreWebVitals.cls}`);

      if (report.failures.length > 0) {
        console.log(`  ❌ Threshold failures:`);
        report.failures.forEach(failure => console.log(`     - ${failure}`));
      } else {
        console.log(`  ✅ All thresholds passed`);
      }

      console.log('');
    }

    // Save detailed report
    const outputDir = path.join(process.cwd(), 'lighthouse-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(outputDir, `lighthouse-report-${timestamp}.json`);

    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        timestamp: new Date().toISOString(),
        totalUrls: urls.length,
        thresholds
      },
      results: reports
    }, null, 2));

    // Generate HTML reports for each URL
    for (let i = 0; i < allResults.length; i++) {
      const { url, lhr } = allResults[i];
      const urlSlug = url.replace(/[^a-zA-Z0-9]/g, '-');
      const htmlPath = path.join(outputDir, `lighthouse-${urlSlug}-${timestamp}.html`);

      fs.writeFileSync(htmlPath, lhr.report);
    }

    console.log('📈 Summary Report');
    console.log('================');

    // Calculate averages
    const avgScores = {
      performance: Math.round(reports.reduce((sum, r) => sum + (r.scores.performance || 0), 0) / reports.length),
      accessibility: Math.round(reports.reduce((sum, r) => sum + (r.scores.accessibility || 0), 0) / reports.length),
      bestPractices: Math.round(reports.reduce((sum, r) => sum + (r.scores.bestPractices || 0), 0) / reports.length),
      seo: Math.round(reports.reduce((sum, r) => sum + (r.scores.seo || 0), 0) / reports.length)
    };

    console.log(`Average Performance: ${avgScores.performance} (target: ≥${thresholds.performance})`);
    console.log(`Average Accessibility: ${avgScores.accessibility} (target: ≥${thresholds.accessibility})`);
    console.log(`Average Best Practices: ${avgScores.bestPractices} (target: ≥${thresholds['best-practices']})`);
    console.log(`Average SEO: ${avgScores.seo} (target: ≥${thresholds.seo})`);

    const totalFailures = reports.reduce((sum, r) => sum + r.failures.length, 0);
    console.log(`\nTotal threshold failures: ${totalFailures}`);

    if (totalFailures === 0) {
      console.log('🎉 All audits passed the performance and accessibility thresholds!');
    } else {
      console.log('⚠️  Some audits failed to meet the thresholds. Check individual reports for details.');
    }

    console.log(`\n📁 Reports saved to: ${outputDir}`);
    console.log(`📊 Detailed report: ${reportPath}`);

    // Exit with error code if thresholds not met
    process.exit(totalFailures > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const singleUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1];
const categories = args.find(arg => arg.startsWith('--only-categories='))?.split('=')[1]?.split(',');

if (singleUrl) {
  urls.splice(0, urls.length, singleUrl);
}

if (categories) {
  config.settings.onlyCategories = categories;
}

// Check if server is running
if (urls.some(url => url.includes('localhost'))) {
  console.log('⚠️  Make sure your development server is running (pnpm dev)');
  console.log('   Or use pnpm perf:lighthouse-dev to start server automatically\n');
}

runAudit();