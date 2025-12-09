import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { extractFileIdFromUrl, downloadFileFromDrive, getFileMetadata } from './drive_helper.js';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(__dirname, '..', 'exports', 'downloads');

// Firebase Config
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Demo Credentials
const EMAIL = 'demo-exclusivo@reduc.test';
const PASSWORD = 'Demo123456';

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

const main = async () => {
    try {
        console.log('Logging in...');
        await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
        console.log('Logged in as demo user.');

        console.log('Fetching folders...');
        const foldersSnapshot = await getDocs(collection(db, 'folders'));
        const folderMap = {};
        foldersSnapshot.docs.forEach(doc => {
            folderMap[doc.id] = doc.data().nombre;
        });
        console.log(`Found ${Object.keys(folderMap).length} folders.`);

        console.log('Fetching materials...');
        const q = query(collection(db, 'material'));
        const querySnapshot = await getDocs(q);

        console.log(`Found ${querySnapshot.size} total materials.`);

        const uniqueCourses = new Set();
        querySnapshot.docs.forEach(doc => {
            const d = doc.data();
            if (d.ramo) uniqueCourses.add(d.ramo);
        });
        console.log('Available courses:', Array.from(uniqueCourses));
        // process.exit(0); // Removed early exit to process files

        let count = 0;
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const title = data.titulo ? data.titulo.toLowerCase() : '';
            const type = data.tipo; // PDF, DOCX, Enlace
            const url = data.archivoUrl;
            const course = data.ramo;
            const folderId = data.carpetaId;

            // Filter logic - Relaxed
            const isRelevant = true;

            // Check for direct file or Drive link
            const isDrive = url && (url.includes('drive.google.com') || url.includes('docs.google.com'));
            const isDirectFile = url && url.startsWith('http') && (type === 'PDF' || url.toLowerCase().endsWith('.pdf'));

            const hasFile = isDirectFile || isDrive;

            if (count < 5) { // Log first 5 attempts to debug
                console.log(`Checking: ${title} (${type}) - Relevant: ${isRelevant}, HasFile: ${hasFile}, Drive: ${isDrive}`);
            }

            if (isRelevant && hasFile && course) {
                const safeCourse = course.replace(/[\/\\?%*:|"<>]/g, '-'); // Sanitize folder name

                // Determine subfolder based on carpetaId
                let subfolder = '';
                if (folderId && folderMap[folderId]) {
                    subfolder = folderMap[folderId].replace(/[\/\\?%*:|"<>]/g, '-');
                }

                const courseDir = subfolder ? path.join(DOWNLOAD_DIR, safeCourse, subfolder) : path.join(DOWNLOAD_DIR, safeCourse);

                if (!fs.existsSync(courseDir)) {
                    fs.mkdirSync(courseDir, { recursive: true });
                }

                const safeTitle = data.titulo.replace(/[\/\\?%*:|"<>]/g, '-');

                if (isDrive) {
                    const fileId = extractFileIdFromUrl(url);
                    if (fileId) {
                        // Include Drive ID in filename for frontend extraction
                        const dest = path.join(courseDir, `${safeTitle}_${fileId}_${doc.id}.pdf`);
                        if (!fs.existsSync(dest)) {
                            console.log(`Downloading Drive File: ${data.titulo} (${course}/${subfolder})...`);
                            try {
                                await downloadFileFromDrive(fileId, dest);
                                count++;
                            } catch (err) {
                                console.error(`Error downloading Drive file ${data.titulo}:`, err.message);
                            }
                        }
                    }
                } else {
                    const ext = 'pdf';
                    // For direct files, we don't have a Drive ID, but we can use a placeholder or just the doc ID
                    // Frontend regex should handle missing Drive ID gracefully or we can append 'Direct'
                    const filename = `${safeTitle}_Direct_${doc.id}.${ext}`;
                    const dest = path.join(courseDir, filename);

                    if (!fs.existsSync(dest)) {
                        console.log(`Downloading Direct: ${data.titulo} (${course}/${subfolder})...`);
                        try {
                            await downloadFile(url, dest);
                            count++;
                        } catch (err) {
                            console.error(`Error downloading ${data.titulo}:`, err.message);
                        }
                    }
                }
            }
        }

        console.log(`Downloaded ${count} new files to ${DOWNLOAD_DIR}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
};

main();
