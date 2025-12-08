import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// Initialize Drive API
let drive;
try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        drive = google.drive({ version: 'v3', auth });
    } else {
        console.warn('⚠️ serviceAccountKey.json not found. Drive features will be disabled.');
    }
} catch (error) {
    console.error('❌ Error initializing Drive API:', error.message);
}

export const extractFileIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : null;
};

export const downloadFileFromDrive = async (fileId, destPath) => {
    // if (!drive) throw new Error('Drive API not initialized'); // Removed early throw

    try {
        if (!drive) throw new Error('Drive API not initialized'); // Throw here to trigger catch block

        const dest = fs.createWriteStream(destPath);
        const res = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        return new Promise((resolve, reject) => {
            res.data
                .on('end', () => resolve(destPath))
                .on('error', (err) => reject(err))
                .pipe(dest);
        });
    } catch (error) {
        // Fallback: Try public export URL if API fails (e.g. no service account)
        try {
            console.log(`Attempting public download fallback for ${fileId}...`);
            const publicUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
            const dest = fs.createWriteStream(destPath);

            // Need to handle redirects for public drive links
            const downloadPublic = (url) => {
                return new Promise((resolve, reject) => {
                    import('https').then(https => {
                        https.get(url, (res) => {
                            if (res.statusCode === 302 || res.statusCode === 303) {
                                downloadPublic(res.headers.location).then(resolve).catch(reject);
                            } else if (res.statusCode !== 200) {
                                reject(new Error(`Public download failed: ${res.statusCode}`));
                            } else {
                                res.pipe(dest);
                                dest.on('finish', () => {
                                    dest.close();
                                    resolve(destPath);
                                });
                            }
                        }).on('error', reject);
                    });
                });
            };

            return await downloadPublic(publicUrl);

        } catch (fallbackError) {
            throw new Error(`Failed to download file ${fileId}: ${error.message} (Fallback also failed: ${fallbackError.message})`);
        }
    }
};

export const getFileMetadata = async (fileId) => {
    if (!drive) throw new Error('Drive API not initialized');
    try {
        const res = await drive.files.get({
            fileId,
            fields: 'id, name, mimeType'
        });
        return res.data;
    } catch (error) {
        throw new Error(`Failed to get metadata for ${fileId}: ${error.message}`);
    }
};
