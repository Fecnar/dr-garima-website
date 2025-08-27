// Google Sheets API utility functions
export class SheetsAPI {
  constructor(serviceAccountEmail, privateKey, sheetId) {
    this.serviceAccountEmail = serviceAccountEmail;
    this.privateKey = privateKey;
    this.sheetId = sheetId;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Create JWT for service account authentication
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // This is simplified - in production, use proper JWT library
    const jwt = await this.createJWT(header, payload);
    
    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return this.accessToken;
  }

  async getAllWishes() {
    const token = await this.getAccessToken();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/Sheet1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    return this.parseWishesData(data.values);
  }

  async updateWishStatus(rowIndex, status) {
    const token = await this.getAccessToken();
    const range = `Sheet1!D${rowIndex + 1}:F${rowIndex + 1}`; // Status, Admin Notes, Date Approved
    
    const values = [
      [status, 'Updated via admin panel', new Date().toISOString()]
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );

    return response.ok;
  }

  parseWishesData(values) {
    if (!values || values.length < 2) return [];
    
    const headers = values[0];
    return values.slice(1).map((row, index) => ({
      rowIndex: index + 1,
      timestamp: row[0] || '',
      name: row[1] || '',
      message: row[2] || '',
      status: row[3] || 'Pending',
      adminNotes: row[4] || '',
      dateApproved: row[5] || ''
    }));
  }

  // Simplified JWT creation (use proper library in production)
  async createJWT(header, payload) {
    // This is a simplified version - implement proper JWT signing
    // For production, use a proper JWT library
    return 'simplified-jwt-token';
  }
}
