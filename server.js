const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const si = require('systeminformation'); // Mengimpor modul systeminformation

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(bodyParser.json());

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

// Endpoint untuk menerima permintaan POST di /openai
app.post('/openai', async (req, res) => {
    const { text } = req.body;

    // Memeriksa apakah 'text' ada di dalam body permintaan
    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Text is required"
        });
    }

    try {
        // Menggunakan API dari widipe.com
        const response = await axios.get(`https://widipe.com/openai?text=${encodeURIComponent(text)}`);

        // Memeriksa apakah response memiliki data yang diharapkan
        if (response.data && response.data.result) {
            // Mengembalikan hasil sesuai format yang diinginkan
            res.json({
                status: true,
                creator: "rizki",  // Ganti creator dengan "Iky"
                result: response.data.result
            });
        } else {
            // Jika tidak ada hasil yang diharapkan
            res.status(500).json({
                status: false,
                message: "Unexpected response format from the API."
            });
        }
    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        res.status(500).json({
            status: false,
            message: "An error occurred while processing your request."
        });
    }
});

// Endpoint untuk mendapatkan informasi sistem
app.get('/system-info', async (req, res) => {
    try {
        const systemInfo = await getSystemInfo(); // Mendapatkan informasi sistem
        res.json({
            status: true,
            memory: systemInfo.memory,
            cpu: systemInfo.cpu
        });
    } catch (error) {
        console.error('Error fetching system information:', error.message);
        res.status(500).json({
            status: false,
            message: "An error occurred while fetching system information."
        });
    }
});

// Endpoint untuk mengunduh video TikTok
app.post('/tiktok', async (req, res) => {
    const { url } = req.body;

    // Memeriksa apakah 'url' ada di dalam body permintaan
    if (!url) {
        return res.status(400).json({
            status: false,
            message: "URL is required"
        });
    }

    try {
        // Menggunakan API dari widipe.com untuk mengunduh video TikTok
        const response = await axios.get(`https://widipe.com/download/tiktokdl?url=${encodeURIComponent(url)}`);

        // Memeriksa apakah response memiliki data yang diharapkan
        if (response.data && response.data.result) {
            res.json({
                status: true,
                code: 200,
                creator: "rizkiirfan",
                result: response.data.result
            });
        } else {
            // Jika tidak ada hasil yang diharapkan
            res.status(500).json({
                status: false,
                message: "Unexpected response format from the API."
            });
        }
    } catch (error) {
        console.error('Error fetching TikTok video:', error.message);
        res.status(500).json({
            status: false,
            message: "An error occurred while processing your request."
        });
    }
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});