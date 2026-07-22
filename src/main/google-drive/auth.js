const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const { getDb } = require('../db');

// Google Drive API scopes
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Port for local OAuth2 callback server
const OAUTH_PORT = 3847;

/**
 * Load OAuth2 credentials from credentials.json
 */
function loadCredentials() {
  try {
    const credentials = require('./credentials.json');
    const { client_id, client_secret } = credentials.installed || credentials.web;
    return { clientId: client_id, clientSecret: client_secret };
  } catch (err) {
    throw new Error(
      'credentials.json tidak ditemukan. ' +
      'Silakan download dari Google Cloud Console dan simpan di src/main/google-drive/credentials.json'
    );
  }
}

/**
 * Get OAuth2 client
 */
function getOAuth2Client() {
  const { clientId, clientSecret } = loadCredentials();
  const redirectUri = `http://localhost:${OAUTH_PORT}/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Get stored refresh token from database
 */
function getStoredToken() {
  const db = getDb();
  const row = db.prepare("SELECT value FROM config WHERE key = 'google_drive_token'").get();
  return row ? JSON.parse(row.value) : null;
}

/**
 * Store refresh token to database
 */
function storeToken(tokens) {
  const db = getDb();
  db.prepare(
    "INSERT INTO config (key, value) VALUES ('google_drive_token', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(tokens));
}

/**
 * Remove stored token from database
 */
function removeToken() {
  const db = getDb();
  db.prepare("DELETE FROM config WHERE key = 'google_drive_token'").run();
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const tokens = getStoredToken();
  return !!(tokens && tokens.refresh_token);
}

/**
 * Get authenticated OAuth2 client
 * Auto-refreshes token if needed
 */
async function getAuthenticatedClient() {
  const tokens = getStoredToken();
  if (!tokens || !tokens.refresh_token) {
    throw new Error('Belum terautentikasi ke Google Drive');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Check if token needs refresh
  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    storeToken(credentials);
  }

  return oauth2Client;
}

/**
 * Generate authorization URL
 */
function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force consent to get refresh_token
  });
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCode(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  storeToken(tokens);
  return tokens;
}

/**
 * Start local server to handle OAuth2 callback
 * Returns a promise that resolves with the authorization code
 */
function startCallbackServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);

      if (parsedUrl.pathname === '/callback') {
        const code = parsedUrl.query.code;
        const error = parsedUrl.query.error;

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px;">
                <h2 style="color: #dc2626;">Authentikasi Gagal</h2>
                <p>Error: ${error}</p>
                <p style="color: #666;">Anda bisa menutup tab ini.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px;">
                <h2 style="color: #16a34a;">Berhasil!</h2>
                <p>Anda sudah terhubung ke Google Drive.</p>
                <p style="color: #666;">Anda bisa menutup tab ini.</p>
              </body>
            </html>
          `);
          server.close();
          resolve(code);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px;">
                <h2 style="color: #dc2626;">Authentikasi Gagal</h2>
                <p>Tidak ada authorization code yang diterima.</p>
                <p style="color: #666;">Anda bisa menutup tab ini.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error('No authorization code received'));
        }
      }
    });

    server.listen(OAUTH_PORT, () => {
      console.log(`OAuth callback server listening on port ${OAUTH_PORT}`);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authentikasi timeout. Silakan coba lagi.'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Logout - remove stored token
 */
function logout() {
  removeToken();
}

module.exports = {
  isAuthenticated,
  getAuthenticatedClient,
  getAuthUrl,
  exchangeCode,
  startCallbackServer,
  logout
};
