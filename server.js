import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle the /config route
app.get('/config', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'config.html'));
});

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'pages', 'welcomePage.html'));
});

app.get('/loading', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'pages', 'loading.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'pages', 'upload.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`GraderBot Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode.`);
});
