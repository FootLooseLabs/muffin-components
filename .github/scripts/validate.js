const fs = require('fs');
const path = require('path');

const ERRORS = [];
const CHECKS = [];
const REQUIRED_MANIFEST_FIELDS = ['domElName', 'description'];
const MALICIOUS_PATTERNS = [
    /\beval\s*\(/,
    /new\s+Function\s*\(/,
    /document\.write\s*\(/,
    /\.innerHTML\s*=\s*['"`].*<script/i,
];

function error(msg) {
    ERRORS.push(`- ${msg}`);
}

function check(label, passed, failMsg) {
    CHECKS.push({ label, passed });
    if (!passed) error(failMsg || label);
}

function writeSummary() {
    const lines = ['## Muffin Component Validation\n'];
    for (const c of CHECKS) {
        lines.push(`- [${c.passed ? 'x' : ' '}] ${c.label}`);
    }
    if (ERRORS.length) {
        lines.push('\n### Errors\n');
        lines.push(...ERRORS.map(e => e));
    }
    fs.writeFileSync('/tmp/validation-summary.md', lines.join('\n') + '\n');
}

function exit() {
    writeSummary();
    if (ERRORS.length) {
        fs.writeFileSync('/tmp/validation-errors.txt', ERRORS.join('\n'));
        console.error('\nValidation failed:\n' + ERRORS.join('\n'));
        process.exit(1);
    }
    console.log('Validation passed.');
    process.exit(0);
}

// ── 1. registry.json is valid JSON ───────────────────────────────────────────

let registry;
try {
    registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'));
    check('registry.json — valid JSON', true);
} catch (e) {
    check('registry.json — valid JSON', false, `registry.json is not valid JSON: ${e.message}`);
    exit();
}

if (!registry.components || typeof registry.components !== 'object') {
    check('registry.json — has "components" object', false, 'registry.json missing top-level "components" object');
    exit();
} else {
    check('registry.json — has "components" object', true);
}

// ── 2. Each component in registry has required fields ────────────────────────

for (const [name, manifest] of Object.entries(registry.components)) {
    const hasRequired = REQUIRED_MANIFEST_FIELDS.every(f => !!manifest[f]);
    const missingFields = REQUIRED_MANIFEST_FIELDS.filter(f => !manifest[f]);
    check(
        `\`${name}\` — required fields (${REQUIRED_MANIFEST_FIELDS.join(', ')})`,
        hasRequired,
        `Component "${name}" missing required field(s): ${missingFields.map(f => `"${f}"`).join(', ')}`
    );

    // ── 3. domElName matches the registry key ────────────────────────────────

    check(
        `\`${name}\` — domElName matches registry key`,
        !manifest.domElName || manifest.domElName === name,
        `Component "${name}": domElName "${manifest.domElName}" must match the registry key`
    );

    // ── 4. Component folder and index.js exist ───────────────────────────────

    const indexPath = path.join('components', name, 'index.js');
    const exists = fs.existsSync(indexPath);
    check(`\`${name}\` — source file exists at components/${name}/index.js`, exists,
        `Component "${name}": missing file at ${indexPath}`);
    if (!exists) continue;

    const source = fs.readFileSync(indexPath, 'utf8');

    // ── 5. index.js defines static domElName ────────────────────────────────

    check(
        `\`${name}\` — defines \`static domElName = "${name}"\``,
        source.includes(`static domElName = "${name}"`),
        `Component "${name}": index.js must define static domElName = "${name}"`
    );

    // ── 6. index.js extends Muffin.DOMComponent ──────────────────────────────

    check(
        `\`${name}\` — extends \`Muffin.DOMComponent\``,
        source.includes('Muffin.DOMComponent'),
        `Component "${name}": index.js must extend Muffin.DOMComponent`
    );

    // ── 7. index.js has a default export ────────────────────────────────────

    check(
        `\`${name}\` — has \`export default\``,
        source.includes('export default'),
        `Component "${name}": index.js must have a default export`
    );

    // ── 8. No malicious patterns ─────────────────────────────────────────────

    const malicious = MALICIOUS_PATTERNS.find(p => p.test(source));
    check(
        `\`${name}\` — no suspicious patterns`,
        !malicious,
        `Component "${name}": suspicious pattern detected — ${malicious}`
    );

    // ── 9. usage first entry is minimal (no attributes) ─────────────────────

    if (manifest.usage?.length) {
        check(
            `\`${name}\` — first usage example is minimal (\`<${name}></${name}>\`)`,
            manifest.usage[0].code.includes(`<${name}>`),
            `Component "${name}": first usage entry must be minimal — just <${name}></${name}>`
        );
    }
}

// ── 10. No orphan folders in components/ without a registry entry ─────────────

if (fs.existsSync('components')) {
    const folders = fs.readdirSync('components');
    for (const folder of folders) {
        check(
            `No orphan folder — \`components/${folder}\` is registered`,
            !!registry.components[folder],
            `Folder "components/${folder}" exists but has no entry in registry.json`
        );
    }
}

exit();
