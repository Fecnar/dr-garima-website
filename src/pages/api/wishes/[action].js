import { google } from 'googleapis';

// Your Google Sheets configuration
const SHEET_ID = '1UEyxz8VHGvQJ5K8wX9mNZrL2c3dB4f5g6h7i8j9k0l'; // Replace with your actual Sheet ID
const CLIENT_EMAIL = 'birthday-wishes-manager@dr-garima-birthday-wishes.iam.gserviceaccount.com';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCo7UpNi0BFott2
7/vnWT6LVxlRhwRKkM8jgX30bh+Fghnq3naPtDEh1GFYvsCKI8ac2nyKPjNvXHCc
Vg5Pwgkx5j3KgdOqPfjDSB4HZK5n3e2BZoyMqm3WEIjyTN0cpznYoXMejI/D3PMG
OYMillJ4Wn4svd/eYOKjaIy5SQCP+JhjUllSZC2mFTiqzLe1PaI/8707yZra/6zt
sUdAUygy38UQI13GOT68R2gvqgbcBK5jBp/TPjDQFhCsGFOOOuu4h/FsIATh0k0O
ui928xozK/+Dk93ltrKuoA0O0u7qDNN9QgRKUU8nOVw7BHoPxc2gXvi72jZISdWx
t2GjybcFAgMBAAECggEAFA+yHklmRZ7Un2haqxvfIJ8kY5k8Ojq+TsInGisl1S4h
M9JdlC1bFGBreyWUKhObl68e0TAX3abFvNs/cdtiSinEttL6NyKK824SGuCrEay6
cv6hvGbVCnIGQXg9XhTB+ucZi8w3mpQXzGpyF15wxthAWcHm3zr0T2GwLKTtyysS
EmlvSvJwgqr4FoSxzsWhYlH0gWXk3jwnseP7Ug3z4BPlTUPwy2CFdc/6rrESbZ/W
HKgVCx8xlvixTeJRGiHxUOH+c7POrlxPNm0WUkwPzoxMEHLhpDnYDznmNfPnavvy
5GN5m5QKDb+wLo7DtIu2e6UCIpao/c7Ofcl53v+plQKBgQDlvqFHVUKFJiBcCqqO
9UXCAJJJNhjh2sWMu4PCMwcpRrPVNN/4v1pCwDuYtm/Ly3CiWmRXnBBkBZZjV4w+
llniz0T6zjiussypIDtx0ZfwqqIPyJLaFDEFBdTjPErG5UWHPf1tYuAY0O5f4Q/a
lxslJgGwPFj87NgHaluiUXuojwKBgQC8O2MXsxEqBpn0r8OumxTqJlarmTLeS+Db
z8ZlT01yAuhdJuhIAWaJ1m+Wz6Sy5qo5mymLcMPt8N/pG/wt0euDPjZBhbgoGJ9s
6WMNyqSsQoIFrY2HBZuCZ19UD5N1hDDaXP2K3SAtj9RxzSVT3/ef+uQVKqZOsFiR
T1ouBWKpKwKBgGzDjLKqiG1kmVk5q3k2YKnxf0+tjqYN3gw8Eap0YeWGlUhQWd/3
JxIG06/+XnrKey5BQNPBDHlts76gCcLvhuo7WdqqmmcKOp2uprXBlf7XqRVzzSH1
ASfxlNFnD7eNfxcBn+KTNqhI8TDu6YSAmNdDYPU//Jjwv2zzSyJTFQm9AoGAYmw7
GD1NkEf7YHI3Q6lbekOptfhZHNtYLBesiXS57g+PKIYblusEjrZNivHwEIuEHrL/
OiYwjM4ShnVXmy3Uk7+H5yLgdDbLxcsTPDblfB0al5V0F1HbSoh61B2A4UXJtaRB
/sY4+Rnn38mA5yaI+GHbuSWf6C1VYkW3xbCTMhkCgYBQwPZ0PHHp+EsIxJPCsqrd
nnRf9NxcM/Ey8hUpo/Aqqf1JfH/mAMjiXumJZlEwDyuOATyyhY+Uz90rjZmItsBq
S4sMz6xL7Lsy+GsEyuGRwsQxFCxQhYS9EgTfFMCWY9nuexwcCp7sWLlYDYEIBtYZ
ksji+1iGcOMWHgPBZPOW9w==
-----END PRIVATE KEY-----`;

// Create authenticated Google Sheets client
async function getGoogleSheetsClient() {
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  return google.sheets({ version: 'v4', auth });
}

// GET: Fetch all wishes from Google Sheets
export async function GET({ params }) {
  const { action } = params;
  
  if (action !== 'get-all') {
    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:F', // Timestamp, Name, Message, Status, Admin Notes, Date Approved
    });

    const rows = response.data.values;
    
    if (!rows || rows.length < 2) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert rows to wish objects
    const wishes = rows.slice(1).map((row, index) => ({
      rowIndex: index + 2, // +2 because we skip header row and sheets are 1-indexed
      timestamp: row[0] || '',
      name: row[1] || 'Anonymous',
      message: row[2] || '',
      status: row[3] || 'Pending',
      adminNotes: row[4] || '',
      dateApproved: row[5] || ''
    }));

    return new Response(JSON.stringify(wishes), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching wishes:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch wishes',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST: Update wish status in Google Sheets
export async function POST({ params, request }) {
  const { action } = params;
  
  if (action !== 'update-status') {
    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { rowIndex, status } = body;

    if (!rowIndex || !status) {
      return new Response(JSON.stringify({ 
        error: 'Missing rowIndex or status' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sheets = await getGoogleSheetsClient();
    
    // Update Status (column D), Admin Notes (column E), Date Approved (column F)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!D${rowIndex}:F${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          status, 
          `Updated via admin panel by system`,
          new Date().toISOString()
        ]]
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: `Wish ${status.toLowerCase()} successfully!`,
      rowIndex: rowIndex,
      newStatus: status,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating wish status:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to update wish status',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// OPTIONS: Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
