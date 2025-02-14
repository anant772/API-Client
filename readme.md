# API Client - Postman Clone

A simple Postman clone built with Flask and JavaScript. This project allows you to send HTTP requests to any API endpoint and view the responses in a clean and user-friendly interface. It also features a request history functionality with a "Load Request" button so you can quickly reload and modify previous requests.

## Features

- **Send HTTP Requests:** Supports GET, POST, PUT, and DELETE methods.
- **Custom Headers & Request Body:** Easily add custom headers and JSON bodies.
- **Response Display:** Shows response status, headers, and body with syntax highlighting for JSON.
- **Request History:** Automatically saves your requests and responses in localStorage for quick review.
- **Load Request:** Reload a previous request into the form to modify and resend it.
- **Theme Toggle:** Switch between dark and light modes.
- **Open Response in New Window:** View the response details in a separate browser window.

## Prerequisites

- Python 3.x
- pip (Python package manager)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>

2. **Create a virtual environment (optional but recommended):**
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

3. **Install the required packages:**
    pip install Flask requests
