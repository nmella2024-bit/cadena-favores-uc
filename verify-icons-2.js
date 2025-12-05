import * as icons from 'lucide-react';

const usedIcons = [
    'Search', 'FileText', 'X', 'Loader2', 'Plus', 'Database', 'Sparkles', 'MessageSquare', 'FileOutput'
];

console.log('--- Verifying AutoStudyWidget Icons ---');
let hasError = false;
usedIcons.forEach(icon => {
    if (!icons[icon]) {
        console.error(`❌ MISSING ICON: ${icon}`);
        hasError = true;
    } else {
        console.log(`✅ Found: ${icon}`);
    }
});

if (hasError) {
    console.log('--- FAIL: Missing icons detected ---');
    process.exit(1);
} else {
    console.log('--- SUCCESS: All icons exist ---');
}
