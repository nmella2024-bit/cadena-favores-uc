import * as icons from 'lucide-react';

const usedIcons = [
    'TrendingUp', 'Loader2', 'Award', // AdaptiveQuiz
    'PenTool', 'BookOpen', // DesarrolloPractice
    'Brain', 'FileText', 'Settings', // QuizGenerator
    'CheckCircle', 'XCircle', 'AlertCircle', 'ArrowRight', 'RefreshCw', // QuizPlayer
    'History', 'Calendar', // StudyHistory
    'AlertTriangle', 'Target', 'CheckCircle2', // WeaknessDetector
    'ArrowLeft', 'Sparkles' // ModoEstudioPro
];

console.log('--- Verifying Icons ---');
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
