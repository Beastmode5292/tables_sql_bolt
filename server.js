const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from current directory
app.use(express.static('.'));

// Handle all routes by serving index.html (for single page app)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Community Center SQL Tutorial is running' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Community Center SQL Tutorial running on port ${PORT}`);
    console.log(`📚 Access your tutorial at: http://localhost:${PORT}`);
});