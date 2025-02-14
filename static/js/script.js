document.addEventListener('DOMContentLoaded', () => {
    // Add Header functionality
    document.querySelector('.add-header-btn').addEventListener('click', addHeader);
    document.getElementById('send-btn').addEventListener('click', sendRequest);

    // Add event listener for the new button
    document.getElementById('open-in-new-window').addEventListener('click', openResponseInNewWindow);
});

// Function to open response in a new window
function openResponseInNewWindow() {
    const responseBody = document.getElementById('response-body').textContent;
    if (!responseBody) {
        alert('No response to display!');
        return;
    }

    // Create a new window
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head>
                <title>Response Viewer</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/json.min.js"></script>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    pre { white-space: pre-wrap; word-break: break-word; }
                </style>
            </head>
            <body>
                <pre><code>${responseBody}</code></pre>
                <script>hljs.highlightAll();</script>
            </body>
        </html>
    `);
    newWindow.document.close();
}

// ... rest of the existing code ...

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
        
        // Pretty-print JSON and color keys
        try {
            const jsonBody = JSON.parse(data.body);
            const formattedJson = JSON.stringify(jsonBody, null, 4);
            const coloredJson = formatJsonKeys(formattedJson);
            document.getElementById('response-body').innerHTML = coloredJson;
        } catch {
            document.getElementById('response-body').textContent = data.body || data.error;
        }

    } catch (error) {
        document.getElementById('response-status').innerHTML = 
            `<i class="fas fa-times-circle"></i> Error: ${error.message}`;
        document.getElementById('response-body').textContent = '';
    }
}

function formatJsonKeys(jsonString) {
    // Color keys
    jsonString = jsonString.replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:');
    
    // Color strings
    jsonString = jsonString.replace(/:"([^"]+)"/g, ':<span class="string">"$1"</span>');
    
    // Color numbers
    jsonString = jsonString.replace(/:(\d+)/g, ':<span class="number">$1</span>');
    
    // Color booleans
    jsonString = jsonString.replace(/: (true|false)/g, ':<span class="boolean">$1</span>');
    
    // Color null
    jsonString = jsonString.replace(/: null/g, ':<span class="null">null</span>');
    
    return jsonString;
}