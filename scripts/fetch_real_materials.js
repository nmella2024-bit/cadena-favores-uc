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
        const parentMap = {};
        foldersSnapshot.docs.forEach(doc => {
            folderMap[doc.id] = doc.data().nombre;
            parentMap[doc.id] = doc.data().carpetaPadreId;
        });
        console.log(`Found ${Object.keys(folderMap).length} folders.`);

        // Folder Overrides (ID -> Course Name)
        const FOLDER_OVERRIDES = {
            'LK229NvvlS5md9ACocRt': 'Cálculo I',
            'qdEASKK8MJvhGAAIaNOu': 'Cálculo I', // Ayudantias
            '9yi5DaaePYViOFnwSxBl': 'Cálculo I', // Pruebas
            'ND4wt8cYzbcJm6n3wVwF': 'Cálculo II',
            'u8P9hlijjKot7GtcCI3U': 'Cálculo III',
            'aHcj3IFR94EIZ3JdVRM8': 'Cálculo III', // Calculo 3 (MAT1630)
            'shfB2VASAvMxFJeRcAWq': 'Cálculo II' // Stewart Calculo 2 folder
        };

        const getCourseFromFolder = (folderId) => {
            let currentId = folderId;
            let depth = 0;
            while (currentId && depth < 5) {
                if (FOLDER_OVERRIDES[currentId]) return FOLDER_OVERRIDES[currentId];
                currentId = parentMap[currentId];
                depth++;
            }
            return null;
        };

        console.log('Fetching materials...');
        const q = query(collection(db, 'material'));
        const querySnapshot = await getDocs(q);

        console.log(`Found ${querySnapshot.size} total materials.`);

        let count = 0;
        const downloadQueue = [];
        const folderCounts = {};
        const MAX_FILES_PER_FOLDER = 5; // Limit for efficiency

        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const title = data.titulo ? data.titulo.toLowerCase() : '';
            const type = data.tipo; // PDF, DOCX, Enlace
            const url = data.archivoUrl;
            let course = data.ramo;
            const folderId = data.carpetaId;

            // Apply Folder Override
            const overriddenCourse = getCourseFromFolder(folderId);
            if (overriddenCourse) {
                course = overriddenCourse;
            }

            // Filter logic - Relaxed
            const isRelevant = true;

            // Check for direct file or Drive link
            const isDrive = url && (url.includes('drive.google.com') || url.includes('docs.google.com'));
            const isDirectFile = url && url.startsWith('http') && (type === 'PDF' || url.toLowerCase().endsWith('.pdf'));

            const hasFile = isDirectFile || isDrive;

            if (isRelevant && hasFile) {
                // Check limit
                if (!folderCounts[folderId]) folderCounts[folderId] = 0;
                if (folderCounts[folderId] >= MAX_FILES_PER_FOLDER) continue;

                const folderName = folderMap[folderId] || 'General';
                // Sanitize course name for folder path
                const safeCourse = course.replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]/g, '').trim();
                const safeFolder = folderName.replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]/g, '').trim();

                const courseDir = path.join(DOWNLOAD_DIR, safeCourse);
                const subDir = path.join(courseDir, safeFolder);

                if (!fs.existsSync(subDir)) {
                    fs.mkdirSync(subDir, { recursive: true });
                }

                // Extract Drive ID if available
                let driveId = '';
                if (isDrive) {
                    driveId = extractFileIdFromUrl(url);
                }

                // Construct filename: Title_DriveID_DocID.ext
                // If no Drive ID, use 'NoDriveID'
                const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
                const ext = isDirectFile ? '.pdf' : '.pdf'; // Assume PDF for Drive links for now
                const filename = `${safeTitle}_${driveId || 'NoDriveID'}_${doc.id}${ext}`;
                const dest = path.join(subDir, filename);

                if (!fs.existsSync(dest)) {
                    folderCounts[folderId]++; // Increment count
                    downloadQueue.push({
                        course: course,
                        fn: async () => {
                            console.log(`Downloading (${count + 1}): ${title} to ${safeCourse}/${safeFolder}`);
                            try {
                                if (isDrive && driveId) {
                                    await downloadFileFromDrive(driveId, dest);
                                } else if (isDirectFile) {
                                    await downloadFile(url, dest);
                                }
                                count++;
                            } catch (error) {
                                console.error(`Error downloading ${title}:`, error.message);
                            }
                        }
                    });
                }
            }
        }

        // Sort queue: Priority to Calculus courses
        downloadQueue.sort((a, b) => {
            const priorityCourses = ['Cálculo I', 'Cálculo II', 'Cálculo III'];
            const aPrio = priorityCourses.includes(a.course);
            const bPrio = priorityCourses.includes(b.course);
            if (aPrio && !bPrio) return -1;
            if (!aPrio && bPrio) return 1;
            return 0;
        });

        // Process queue in batches
        const BATCH_SIZE = 50; // Increased for efficiency
        for (let i = 0; i < downloadQueue.length; i += BATCH_SIZE) {
            const batch = downloadQueue.slice(i, i + BATCH_SIZE);
            console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(downloadQueue.length / BATCH_SIZE)}...`);
            await Promise.all(batch.map(item => item.fn()));
        }

        console.log(`Downloaded ${count} new files to ${DOWNLOAD_DIR}`);

        console.log('--- MATERIALS WITH "CALCULO" IN TITLE ---');
        querySnapshot.docs.forEach(doc => {
            const d = doc.data();
            if (d.titulo && d.titulo.toLowerCase().includes('calculo')) {
                console.log(`Title: ${d.titulo}, FolderID: ${d.carpetaId}, Ramo: ${d.ramo}`);
            }
        });
        console.log('--------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
};

main();

