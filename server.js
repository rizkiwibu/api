const express = require('express');
const axios = require('axios');
const si = require('systeminformation'); // Mengimpor modul systeminformation

const app = express();
const PORT = process.env.PORT || 3000;

// Fungsi untuk mendapatkan informasi CPU dan memori
async function getSystemInfo() {
    const memory = await si.mem();
    const cpu = await si.cpu();

    return {
        memory: `${(memory.used / 1024 / 1024).toFixed(2)}MB / ${(memory.total / 1024 / 1024).toFixed(2)}MB`,
        cpu: {
            count: cpu.cores,
            model: cpu.brand,
            speed: `${cpu.speed} MHz`
        }
    };
}

// Fungsi untuk OpenAI
async function handleOpenAI(text) {
    if (!text) {
        throw new Error("Text is required");
    }

    const response = await axios.get(`https://widipe.com/openai?text=${encodeURIComponent(text)}`);
    if (response.data && response.data.result) {
        return {
            status: true,
            creator: "rizki",
            result: response.data.result
        };
    } else {
        throw new Error("Unexpected response format from the API.");
    }
}

// Fungsi untuk TikTok
async function handleTikTok(url) {
    if (!url) {
        throw new Error("URL is required");
    }

    const response = await axios.get(`https://widipe.com/download/tiktokdl?url=${encodeURIComponent(url)}`);
    if (response.data && response.data.result) {
        return {
            status: true,
            code: 200,
            creator: "rizkiirfan",
            result: response.data.result
        };
    } else {
        throw new Error("Unexpected response format from the API.");
    }
}

// Fungsi untuk System Info
async function handleSystemInfo() {
    const systemInfo = await getSystemInfo();
    return {
        status: true,
        memory: systemInfo.memory,
        cpu: systemInfo.cpu
    };
}

// Endpoint untuk menangani permintaan berdasarkan fitur
app.get('/feature', async (req, res) => {
    const { fitur, text, url } = req.query;

    try {
        let result;

        switch (fitur) {
            case 'openai':
                result = await handleOpenAI(text);
                break;
            case 'tiktok':
                result = await handleTikTok(url);
                break;
            case 'system-info':
                result = await handleSystemInfo();
                break;
            default:
                return res.status(404).json({
                    status: false,
                    message: "Feature not found"
                });
        }

        res.json(result);
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({
            status: false,
            message: error.message || "An error occurred while processing your request."
        });
    }
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
