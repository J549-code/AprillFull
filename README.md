# April Fools Session Tracker

A prank page that secretly tracks visitor sessions and stores them in a database.

## Features

- 🎭 April Fools prank interface with hacking theme
- 📊 Automatic session tracking when page loads
- 🔍 Collects visitor information (IP, location, browser, etc.)
- 🔒 Password-protected admin panel to view collected data
- 💾 SQLite database for storing session information

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

3. **Access the pages:**
   - Prank page: http://localhost:3000/index.html
   - Admin panel: http://localhost:3000/admin?pw=admin123

## What gets tracked?

When someone visits the prank page, the system automatically captures:
- Unique session ID
- IP address (server-side)
- User agent (browser info)
- Geographic location (with permission)
- Screen resolution
- Language and platform
- Referrer information
- Storage capabilities

## Security

⚠️ **Important:** Change the default admin password!
- Edit `server.js` and change `'admin123'` to a secure password
- The admin panel is protected by this password

## Database

The system uses SQLite (`sessions.db`) to store session data. The database is automatically created when the server starts.

## Deployment

To deploy this online:
1. Upload all files to a server
2. Run `npm install` on the server
3. Start the server with `npm start`
4. Share the prank page URL with your friends!

## Admin Panel Features

- View all captured sessions
- See total and today's session counts
- Sortable table with all visitor information
- Real-time data updates

## Legal Note

This is for educational/entertainment purposes only. Make sure you comply with local privacy laws when collecting user data.
