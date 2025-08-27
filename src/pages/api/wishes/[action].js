// API endpoint for wishes management
export async function POST({ params, request }) {
  const { action } = params;
  
  try {
    const body = await request.json();
    
    // Initialize Sheets API
    const sheetsAPI = new SheetsAPI(
      import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      import.meta.env.GOOGLE_PRIVATE_KEY,
      import.meta.env.GOOGLE_SHEET_ID
    );

    switch (action) {
      case 'get-all':
        const wishes = await sheetsAPI.getAllWishes();
        return new Response(JSON.stringify(wishes), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'update-status':
        const { rowIndex, status } = body;
        const success = await sheetsAPI.updateWishStatus(rowIndex, status);
        return new Response(JSON.stringify({ success }), {
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Invalid action', { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET({ params }) {
  if (params.action === 'get-all') {
    try {
      const sheetsAPI = new SheetsAPI(
        import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        import.meta.env.GOOGLE_PRIVATE_KEY,
        import.meta.env.GOOGLE_SHEET_ID
      );
      
      const wishes = await sheetsAPI.getAllWishes();
      return new Response(JSON.stringify(wishes), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
