/**
 * Script to set up translation files for all supported languages
 * This copies English files to all other language directories as a starting point
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define all supported languages
const LANGUAGES = ['id', 'en', 'de', 'ja', 'ko', 'zh', 'ar'];

// Path to locales directory
const LOCALES_DIR = path.join(__dirname, '../public/locales');

// Get all JSON files from the English directory
const enDir = path.join(LOCALES_DIR, 'en');
const enFiles = fs.readdirSync(enDir).filter((file) => file.endsWith('.json'));

// Create directories for all languages if they don't exist
LANGUAGES.forEach((lang) => {
    const langDir = path.join(LOCALES_DIR, lang);
    if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
    }
});

// Copy English files to all other language directories if they don't exist
LANGUAGES.forEach((lang) => {
    if (lang === 'en') return; // Skip English

    const langDir = path.join(LOCALES_DIR, lang);

    enFiles.forEach((file) => {
        const sourcePath = path.join(enDir, file);
        const targetPath = path.join(langDir, file);

        // Only copy if the file doesn't exist
        if (!fs.existsSync(targetPath)) {
            const content = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
            fs.writeFileSync(
                targetPath,
                JSON.stringify(content, null, 2),
                'utf8'
            );
        } else {
        }
    });
});
