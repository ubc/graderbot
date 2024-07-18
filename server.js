import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import multer from 'multer';
import fs from 'fs';
import csvToJson from 'convert-csv-to-json';
import { cleanCSVData, restoreNewlinesInJSON } from './server_modules/csv/utils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2123;

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Handle the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle the /onboarding route
app.get('/onboarding', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'onboarding.html'));
});

// Handle the /config route
app.get('/config', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'config.html'));
});

// Logger function
const logger = (debugMode, message, ...optionalParams) => {
    if (debugMode) {
        console.log(message, ...optionalParams);
    }
};

// Example endpoint to generate a response
app.post('/generate', async (req, res) => {
    const { debugMode, llmUrl } = req.body;
    const url = llmUrl || 'http://localhost:11434/api/generate';
    logger(debugMode, `Request received for /generate with URL: ${url}`); // Log when request is received

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model: 'llama3', prompt: 'Why is the sky blue?' })
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        logger(debugMode, 'Response from external API received'); // Log when response is received

        // Set headers to ensure the response is treated as streaming
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Use response.body directly as a stream
        response.body.pipe(res);

        response.body.on('data', chunk => {
            logger(debugMode, 'Chunk received:', chunk.toString()); // Log each chunk
        });

        response.body.on('end', () => {
            logger(debugMode, 'Response streaming completed'); // Log when response streaming is complete
        });

    } catch (error) {
        logger(debugMode, 'Error:', error); // Log any errors
        res.status(500).json({ error: error.message });
    }
});

app.post('/upload-csv', upload.fields([{ name: 'csvFile1' }, { name: 'csvFile2' }, { name: 'csvFile3' }]), (req, res) => {
    const debugMode = req.body.debugMode === 'true';
    const files = req.files;
    const jsonData = {};

    try {
        Object.keys(files).forEach((key) => {
            const file = files[key][0];
            const filePath = file.path;

            // Read the CSV file content
            const csvString = fs.readFileSync(filePath, 'utf-8');

            // Clean the CSV data
            const cleanedCSVString = cleanCSVData(csvString);

            // Save the cleaned CSV data to a temporary file
            const tempFilePath = filePath + '.tmp';
            fs.writeFileSync(tempFilePath, cleanedCSVString);

            // Convert cleaned CSV to JSON
            const json = csvToJson.fieldDelimiter(',').supportQuotedField(true).getJsonFromCsv(tempFilePath);

            // Restore newlines in JSON data
            jsonData[key] = restoreNewlinesInJSON(json);

            // Delete the original and temporary CSV files
            fs.unlinkSync(filePath);
            fs.unlinkSync(tempFilePath);
        });

        logger(debugMode, 'CSV files processed:', jsonData);
        res.json(jsonData);
    } catch (error) {
        logger(debugMode, 'Error processing CSV files:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
