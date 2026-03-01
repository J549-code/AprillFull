const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite database
const db = new sqlite3.Database('./sessions.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTable();
    }
});

// Create sessions table
function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            location TEXT,
            referrer TEXT,
            screen_resolution TEXT,
            language TEXT,
            platform TEXT,
            cookies_enabled BOOLEAN,
            local_storage BOOLEAN,
            session_storage BOOLEAN
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Sessions table ready');
        }
    });
}

// Endpoint to track session
app.post('/track', (req, res) => {
    const sessionId = uuidv4();
    const {
        ip_address,
        user_agent,
        location,
        referrer,
        screen_resolution,
        language,
        platform,
        cookies_enabled,
        local_storage,
        session_storage
    } = req.body;

    const sql = `
        INSERT INTO sessions (
            session_id, ip_address, user_agent, location, referrer,
            screen_resolution, language, platform, cookies_enabled,
            local_storage, session_storage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        sessionId,
        ip_address,
        user_agent,
        location,
        referrer,
        screen_resolution,
        language,
        platform,
        cookies_enabled,
        local_storage,
        session_storage
    ], function(err) {
        if (err) {
            console.error('Error inserting session:', err);
            res.status(500).json({ error: 'Failed to track session' });
        } else {
            res.json({ 
                success: true, 
                sessionId: sessionId,
                message: 'Session tracked successfully'
            });
        }
    });
});

// Admin endpoint to view sessions (with simple password protection)
app.get('/admin', (req, res) => {
    const password = req.query.pw;
    
    // Simple password protection - change 'yourpassword' to something secure
    if (password !== '0urJ@n123') {
        return res.status(403).send(`
            <html>
                <head><title>Access Denied</title></head>
                <body style="font-family: Arial; text-align: center; margin-top: 100px;">
                    <h1>Access Denied</h1>
                    <p>Invalid password. Please provide the correct password.</p>
                </body>
            </html>
        `);
    }

    // Fetch all sessions
    const sql = 'SELECT * FROM sessions ORDER BY timestamp DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving sessions');
            return;
        }

        // Generate HTML table
        let html = `
            <html>
                <head>
                    <title>Session Tracker Admin</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                        h1 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background: #4CAF50; color: white; }
                        tr:hover { background: #f5f5f5; }
                        .stats { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                        .session-id { font-family: monospace; background: #f0f0f0; padding: 2px 4px; }
                    </style>
                </head>
                <body>
                    <h1>🔍 Session Tracker Admin Panel</h1>
                    <div class="stats">
                        <h3>Statistics</h3>
                        <p><strong>Total Sessions:</strong> ${rows.length}</p>
                        <p><strong>Today's Sessions:</strong> ${rows.filter(r => {
                            const sessionDate = new Date(r.timestamp).toDateString();
                            const today = new Date().toDateString();
                            return sessionDate === today;
                        }).length}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Session ID</th>
                                <th>IP Address</th>
                                <th>User Agent</th>
                                <th>Location</th>
                                <th>Platform</th>
                                <th>Screen Resolution</th>
                                <th>Language</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        rows.forEach(row => {
            html += `
                <tr>
                    <td class="session-id">${row.session_id}</td>
                    <td>${row.ip_address || 'N/A'}</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${row.user_agent || 'N/A'}</td>
                    <td>${row.location || 'N/A'}</td>
                    <td>${row.platform || 'N/A'}</td>
                    <td>${row.screen_resolution || 'N/A'}</td>
                    <td>${row.language || 'N/A'}</td>
                    <td>${new Date(row.timestamp).toLocaleString()}</td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                    <p style="margin-top: 20px; color: #666;">
                        <small>Last updated: ${new Date().toLocaleString()}</small>
                    </p>
                </body>
            </html>
        `;

        res.send(html);
    });
});

// API endpoint to get session data as JSON
app.get('/api/sessions', (req, res) => {
    const password = req.query.pw;
    if (password !== '0urJ@n123') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const sql = 'SELECT * FROM sessions ORDER BY timestamp DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin?pw=0urJ@n123`);
    console.log(`Prank page: http://localhost:${PORT}/index.html`);
});
