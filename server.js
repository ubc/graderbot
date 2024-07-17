import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Ensure you have this installed

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
    const { debugMode } = req.body;
    logger(debugMode, 'Request received for /generate'); // Log when request is received
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
