import browserSync from 'browser-sync';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const LIVERELOAD_PORT = process.env.LIVERELOAD_PORT || 2123;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

browserSync.init({
    proxy: `http://localhost:${PORT}`,
    files: ["public/**/*.*"],
    port: LIVERELOAD_PORT,
    open: false,
    ui: false
});
