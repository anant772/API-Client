from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send-request', methods=['POST'])
def send_request():
    try:
        url = request.json.get('url')
        method = request.json.get('method', 'GET')
        headers = request.json.get('headers', {})
        body = request.json.get('body', None)

        headers_dict = {h['key']: h['value'] for h in headers if h.get('key')}

        response = requests.request(
            method=method,
            url=url,
            headers=headers_dict,
            json=body if method in ['POST', 'PUT', 'PATCH'] else None
        )

        response_data = {
            'status_code': response.status_code,
            'headers': dict(response.headers),
            'body': response.text
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)