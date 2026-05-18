const fs = require('fs');
const path = require('path');

const ERRORS = [];
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

function exit() {
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
} catch (e) {
    error(`registry.json is not valid JSON: ${e.message}`);
    exit();
}

if (!registry.components || typeof registry.components !== 'object') {
    error('registry.json missing top-level "components" object');
    exit();
}

// ── 2. Each component in registry has required fields ────────────────────────

for (const [name, manifest] of Object.entries(registry.components)) {
    for (const field of REQUIRED_MANIFEST_FIELDS) {
        if (!manifest[field]) {
            error(`Component "${name}" missing required field: "${field}"`);
        }
    }

    // ── 3. domElName matches the registry key ────────────────────────────────

    if (manifest.domElName && manifest.domElName !== name) {
        error(`Component "${name}": domElName "${manifest.domElName}" must match the registry key`);
    }

    // ── 4. Component folder and index.js exist ───────────────────────────────

    const indexPath = path.join('components', name, 'index.js');
    if (!fs.existsSync(indexPath)) {
        error(`Component "${name}": missing file at ${indexPath}`);
        continue;
    }

    const source = fs.readFileSync(indexPath, 'utf8');

    // ── 5. index.js defines static domElName ────────────────────────────────

    if (!source.includes(`static domElName = "${name}"`)) {
        error(`Component "${name}": index.js must define static domElName = "${name}"`);
    }

    // ── 6. index.js extends Muffin.DOMComponent ──────────────────────────────

    if (!source.includes('Muffin.DOMComponent')) {
        error(`Component "${name}": index.js must extend Muffin.DOMComponent`);
    }

    // ── 7. index.js has a default export ────────────────────────────────────

    if (!source.includes('export default')) {
        error(`Component "${name}": index.js must have a default export`);
    }

    // ── 8. No malicious patterns ─────────────────────────────────────────────

    for (const pattern of MALICIOUS_PATTERNS) {
        if (pattern.test(source)) {
            error(`Component "${name}": suspicious pattern detected — ${pattern}`);
        }
    }

    // ── 9. usage first entry is minimal (no attributes) ─────────────────────

    if (manifest.usage?.length) {
        const first = manifest.usage[0];
        if (!first.code.includes(`<${name}>`)) {
            error(`Component "${name}": first usage entry must be minimal — just <${name}></${name}>`);
        }
    }
}

// ── 10. No orphan folders in components/ without a registry entry ─────────────

if (fs.existsSync('components')) {
    const folders = fs.readdirSync('components');
    for (const folder of folders) {
        if (!registry.components[folder]) {
            error(`Folder "components/${folder}" exists but has no entry in registry.json`);
        }
    }
}

exit();
