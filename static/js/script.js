document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.add-header-btn').addEventListener('click', addHeader);
    document.getElementById('send-btn').addEventListener('click', sendRequest);
    document.getElementById('clear-history').addEventListener('click', clearHistory);
    displayHistory();

    // Add event listener for the theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    // Add event listener for the new button
    document.getElementById('open-in-new-window').addEventListener('click', openResponseInNewWindow);
});

// Function to toggle between dark and light modes
function toggleTheme() {
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Function to set the theme
function setTheme(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

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
                    body { font-family: Arial, sans-serif; padding: 10px; }
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
            saveToHistory({ method, url, headers, body }, data);
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


// Save request to history
function saveToHistory(requestData, responseData) {
    const entry = {
        timestamp: new Date().toISOString(),
        method: requestData.method,
        url: requestData.url,
        headers: requestData.headers,
        requestBody: requestData.body,
        response: responseData
    };

    const history = JSON.parse(localStorage.getItem('requestHistory') || '[]');
    history.unshift(entry); // Add to beginning
    if (history.length > 50) history.pop(); // Keep last 50 entries
    localStorage.setItem('requestHistory', JSON.stringify(history));
    displayHistory();
}

// Display history
function displayHistory() {
    const history = JSON.parse(localStorage.getItem('requestHistory') || '[]');
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    history.forEach((entry, index) => {
        const entryEl = document.createElement('div');
        entryEl.className = 'history-entry';
        entryEl.innerHTML = `
            <div>
                <span class="history-method">${entry.method}</span>
                <span class="history-url">${entry.url}</span>
                <span class="history-status">${entry.response?.status_code || 'Error'}</span>
            </div>
            <div class="history-details">
                <button onclick="copyResponseToBody(${index})"><i class="fas fa-copy"></i> Use Response</button>
                <button onclick="loadRequestFromHistory(${index})"><i class="fas fa-sync"></i> Load Request</button>
                <pre>${JSON.stringify(entry.response, null, 2)}</pre>
            </div>
        `;
        entryEl.querySelector('.history-details').style.display = 'none';
        entryEl.addEventListener('click', () => toggleHistoryDetails(entryEl));
        list.appendChild(entryEl);
    });
}

// Toggle details visibility
function toggleHistoryDetails(entryEl) {
    const details = entryEl.querySelector('.history-details');
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
}

// Copy response to request body
function copyResponseToBody(index) {
    const history = JSON.parse(localStorage.getItem('requestHistory'));
    const responseBody = history[index].response.body;
    document.getElementById('body').value = responseBody;
}

// Clear history
function clearHistory() {
    localStorage.removeItem('requestHistory');
    displayHistory();
}


function loadRequestFromHistory(index) { 

    const history = JSON.parse(localStorage.getItem('requestHistory') || '[]');
    const entry = history[index]; if (!entry) return;

    // Set URL and method
    document.getElementById('url').value = entry.url;
    document.getElementById('method').value = entry.method;
    
    // Set request body (if available)
    if (entry.requestBody) {
        try {
            // If stored as an object, pretty-print it
            document.getElementById('body').value = JSON.stringify(entry.requestBody, null, 4);
        } catch (e) {
            document.getElementById('body').value = entry.requestBody;
        }
    } else {
        document.getElementById('body').value = '';
    }
    
    // Clear existing headers
    const headersDiv = document.getElementById('headers');
    headersDiv.innerHTML = '';
    
    // Populate headers from history (if any)
    if (entry.headers && entry.headers.length > 0) {
        entry.headers.forEach(hdr => {
            const newHeader = document.createElement('div');
            newHeader.className = 'header-row';
            newHeader.innerHTML = `
                <input type="text" class="header-input" placeholder="Key" value="${hdr.key}">
                <input type="text" class="header-input" placeholder="Value" value="${hdr.value}">
                <button onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>
            `;
            headersDiv.appendChild(newHeader);
        });
    } else {
        // If no headers were saved, add one empty header row.
        addHeader();
    }
    }
