const express = require('express');
const router = express.Router();
const axios = require('axios');

const DID_API_KEY = process.env.DID_API_KEY;

const getAuthHeader = () => {
    if (!DID_API_KEY) return null;
    return DID_API_KEY.includes(':') 
        ? `Basic ${Buffer.from(DID_API_KEY).toString('base64')}` 
        : `Basic ${DID_API_KEY}`;
};

// Create a new streaming session
router.post('/session', async (req, res) => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
        return res.status(500).json({ error: "DID_API_KEY not configured in .env" });
    }

    console.log("D-ID: Initiating session...");

    try {
        const response = await axios.post(
            'https://api.d-id.com/talks/streams',
            { source_url: "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.png" },
            {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("D-ID: Session created successfully", response.data.id);
        res.json(response.data);
    } catch (err) {
        console.error("D-ID Session Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to start D-ID session", details: err.response?.data?.description });
    }
});

// Submit ICE candidate
router.post('/session/:sessionId/ice', async (req, res) => {
    const authHeader = getAuthHeader();
    const { sessionId } = req.params;
    const { candidate, sdpMid, sdpMLineIndex } = req.body;

    try {
        await axios.post(
            `https://api.d-id.com/talks/streams/${sessionId}/ice`,
            { candidate, sdpMid, sdpMLineIndex },
            {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json({ success: true });
    } catch (err) {
        console.error("D-ID ICE Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to submit ICE" });
    }
});

// Start the stream with an SDP answer
router.post('/session/:sessionId/start', async (req, res) => {
    const authHeader = getAuthHeader();
    const { sessionId } = req.params;
    const { answer } = req.body;

    try {
        await axios.post(
            `https://api.d-id.com/talks/streams/${sessionId}/sdp`,
            { answer, session_id: sessionId },
            {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("D-ID: Stream started");
        res.json({ success: true });
    } catch (err) {
        console.error("D-ID Start Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to start D-ID stream" });
    }
});

// Trigger speech (Talk)
router.post('/session/:sessionId/speak', async (req, res) => {
    const authHeader = getAuthHeader();
    const { sessionId } = req.params;
    const { text } = req.body;

    try {
        await axios.post(
            `https://api.d-id.com/talks/streams/${sessionId}`,
            {
                script: {
                    type: 'text',
                    subtitles: 'false',
                    provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
                    ssml: 'false',
                    input: text
                },
                config: { fluent: 'false', pad_audio: '0.0' },
                session_id: sessionId
            },
            {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("D-ID: Speech triggered", text.substring(0, 20) + "...");
        res.json({ success: true });
    } catch (err) {
        console.error("D-ID Speak Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to trigger D-ID speech" });
    }
});

module.exports = router;
