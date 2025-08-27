// API endpoint for wishes management
// File: src/pages/api/wishes/[action].js

export async function GET({ params }) {
  const { action } = params;
  
  if (action === 'get-all') {
    try {
      // For now, return sample data to test the API structure
      const sampleWishes = [
        {
          rowIndex: 1,
          timestamp: new Date().toISOString(),
          name: 'Sarah Johnson',
          message: 'Happy Birthday, Dr. Garima! You\'re such an inspiration and an amazing physiotherapist. Hope your day is filled with joy!',
          status: 'Pending',
          adminNotes: '',
          dateApproved: ''
        },
        {
          rowIndex: 2,
          timestamp: new Date(Date.now() - 5*60*60*1000).toISOString(),
          name: 'Mike Chen',
          message: 'Wishing you the happiest of birthdays! Thank you for helping me recover from my injury. You\'re the best! 💪',
          status: 'Pending',
          adminNotes: '',
          dateApproved: ''
        },
        {
          rowIndex: 3,
          timestamp: new Date(Date.now() - 24*60*60*1000).toISOString(),
          name: 'Your Best Friend',
          message: 'Happy Birthday, Dr. Garima! 🎉 You\'re such an amazing person and an incredible physiotherapist. Hope your special day is filled with joy, laughter, and all your favorite things!',
          status: 'Approved',
          adminNotes: 'Beautiful message',
          dateApproved: new Date(Date.now() - 2*60*60*1000).toISOString()
        }
      ];
      
      return new Response(JSON.stringify(sampleWishes), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      console.error('GET Error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch wishes data'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Invalid action for GET request' }), { 
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ params, request }) {
  const { action } = params;
  
  try {
    const body = await request.json();
    console.log('POST request received:', { action, body });
    
    if (action === 'update-status') {
      const { rowIndex, status } = body;
      
      // Validate input
      if (!rowIndex || !status) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing rowIndex or status' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For now, just simulate success
      console.log(`Updating wish at row ${rowIndex} to status: ${status}`);
      
      // TODO: This is where we'll add Google Sheets API integration
      // const sheetsAPI = new SheetsAPI(
      //   process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      //   process.env.GOOGLE_PRIVATE_KEY,
      //   process.env.GOOGLE_SHEET_ID
      // );
      // const success = await sheetsAPI.updateWishStatus(rowIndex, status);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Wish ${status.toLowerCase()} successfully!`,
        rowIndex: rowIndex,
        newStatus: status,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Invalid action for POST request',
      availableActions: ['update-status']
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('POST Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Failed to process request'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS({ params }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
