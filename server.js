const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint - MUST be before catch-all route
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Community Center SQL Tutorial is running',
        timestamp: new Date().toISOString()
    });
});

// Serve static files from current directory
app.use(express.static('.'));

// Handle all other routes by serving index.html (for single page app)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Community Center SQL Tutorial running on port ${PORT}`);
    console.log(`📚 Access your tutorial at: http://localhost:${PORT}`);
    console.log(`❤️ Health check available at: http://localhost:${PORT}/health`);
});