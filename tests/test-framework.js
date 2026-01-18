/**
 * Simple Vanilla JS Test Framework
 * No build tools, no libraries. Just DOM and console.
 */

const TestFramework = (function() {
    let stats = { passed: 0, failed: 0, total: 0 };
    let currentSuite = "Global";

    function log(message, type = 'info') {
        const results = document.getElementById('test-results');
        if (!results) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        const el = document.createElement('div');
        el.className = `test-result ${type}`;
        el.textContent = message;
        results.appendChild(el);
    }

    function describe(suiteName, fn) {
        currentSuite = suiteName;
        log(`Suite: ${suiteName}`, 'suite');
        try {
            fn();
        } catch (e) {
            log(`Suite Error: ${e.message}`, 'error');
        }
    }

    function it(testName, fn) {
        stats.total++;
        try {
            fn();
            stats.passed++;
            log(`  ✔ ${testName}`, 'pass');
        } catch (e) {
            stats.failed++;
            log(`  ✘ ${testName}: ${e.message}`, 'fail');
            console.error(e);
        }
    }

    function expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                const actualStr = JSON.stringify(actual);
                const expectedStr = JSON.stringify(expected);
                if (actualStr !== expectedStr) {
                    throw new Error(`Expected ${expectedStr}, but got ${actualStr}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toContain: (item) => {
                if (!actual.includes(item)) {
                    throw new Error(`Expected array to contain ${item}`);
                }
            }
        };
    }

    function summary() {
        const color = stats.failed > 0 ? 'fail' : 'pass';
        log(`-----------------------------------`, 'info');
        log(`Total: ${stats.total} | Passed: ${stats.passed} | Failed: ${stats.failed}`, color);
        
        // Update favicon to red/green
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            const emoji = stats.failed > 0 ? '❌' : '✅';
            favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
        }
    }

    return { describe, it, expect, summary };
})();

// Expose globals
window.describe = TestFramework.describe;
window.it = TestFramework.it;
window.expect = TestFramework.expect;
window.runTests = TestFramework.summary;
