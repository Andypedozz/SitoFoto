// Response Utils
export const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const handleError = (error) => {
    console.error('API Error:', error);
    return jsonResponse({ 
        error: true, 
        message: error.message 
    }, 500);
};