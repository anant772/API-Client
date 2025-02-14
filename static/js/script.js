document.addEventListener('DOMContentLoaded', () => {
    // Add Header functionality
    document.querySelector('.add-header-btn').addEventListener('click', addHeader);
    document.getElementById('send-btn').addEventListener('click', sendRequest);
});

function addHeader() {
    const headersDiv = document.getElementById('headers');
    const newHeader = document.createElement('div');
    newHeader.className = 'header-row';
    newHeader.innerHTML = `
        <input type="text" class="header-input" placeholder="Key">
        <input type="text" class="header-input" placeholder="Value">
        <button onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>
    `;
    headersDiv.appendChild(newHeader);
}

async function sendRequest() {
    const url = document.getElementById('url').value;
    const method = document.getElementById('method').value;
    const body = document.getElementById('body').value;
    
    // Collect headers
    const headers = [];
    document.querySelectorAll('.header-row').forEach(row => {
        const key = row.children[0].value;
        const value = row.children[1].value;
        if (key) headers.push({ key, value });
    });

    try {
        const response = await fetch('/send-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url,
                method,
                headers,
                body: body ? JSON.parse(body) : null
            })
        });

        const data = await response.json();
        
        // Display response
        document.getElementById('response-status').innerHTML = 
            `<i class="fas fa-check-circle"></i> Status: ${data.status_code || 'No response'}`;
        document.getElementById('response-body').textContent = 
            data.body || data.error;
        
    } catch (error) {
        document.getElementById('response-status').innerHTML = 
            `<i class="fas fa-times-circle"></i> Error: ${error.message}`;
        document.getElementById('response-body').textContent = '';
    }
}