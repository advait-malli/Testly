from flask import Flask, request, jsonify
from werkzeug.serving import run_simple
import os
import json
from pathlib import Path
from datetime import datetime, timedelta
import secrets

app = Flask(__name__)

# Configuration
BASE_DIR = Path(__file__).parent.absolute()
TESTS_DIR = BASE_DIR / "tests"
TESTS_DIR.mkdir(exist_ok=True)

# In-memory storage for active test codes (in a real app, use a database)
active_tests = {}

# Generate a unique test code
def generate_test_code():
    return secrets.token_hex(4).upper()

# Create a new test
@app.route('/api/tests/create', methods=['POST'])
def create_test():
    try:
        data = request.get_json()
        test_name = data.get('test_name')
        
        if not test_name:
            return jsonify({'error': 'Test name is required'}), 400
            
        # Generate a unique test code
        test_code = generate_test_code()
        test_dir = TESTS_DIR / test_code
        test_dir.mkdir(exist_ok=True)
        
        # Save test data
        test_data = {
            'test_code': test_code,
            'test_name': test_name,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(days=7)).isoformat(),
            'subjects': {}
        }
        
        # Save test info
        with open(test_dir / 'testinfo.json', 'w') as f:
            json.dump(test_data, f, indent=2)
            
        # Add to active tests
        active_tests[test_code] = test_data
        
        return jsonify({
            'success': True,
            'test_code': test_code,
            'test_name': test_name
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Upload test files
@app.route('/api/tests/<test_code>/upload', methods=['POST'])
def upload_test_files(test_code):
    try:
        if test_code not in active_tests:
            return jsonify({'error': 'Invalid test code'}), 404
            
        test_dir = TESTS_DIR / test_code
        files = request.files
        
        for file_key in files:
            file = files[file_key]
            # Save file to the test directory
            file_path = test_dir / file.filename
            file.save(file_path)
            
        return jsonify({'success': True, 'message': 'Files uploaded successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get test information
@app.route('/api/tests/<test_code>', methods=['GET'])
def get_test(test_code):
    try:
        test_dir = TESTS_DIR / test_code
        test_info_path = test_dir / 'testinfo.json'
        
        if not test_info_path.exists():
            return jsonify({'error': 'Test not found'}), 404
            
        with open(test_info_path, 'r') as f:
            test_data = json.load(f)
            
        return jsonify(test_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Fetch test files
@app.route('/api/tests/fetch', methods=['POST'])
def fetch_test():
    try:
        data = request.get_json()
        test_code = data.get('test_code')
        
        if not test_code:
            return jsonify({'error': 'Test code is required'}), 400
            
        test_dir = TESTS_DIR / test_code
        if not test_dir.exists():
            return jsonify({'error': 'Test not found'}), 404
            
        # Load test info
        with open(test_dir / 'testinfo.json', 'r') as f:
            test_data = json.load(f)
            
        # Prepare response with all test files
        response_data = {
            'test_code': test_data['test_code'],
            'test_name': test_data['test_name'],
            'files': {}
        }
        
        # Add all files in the test directory
        for root, _, files in os.walk(test_dir):
            for file in files:
                if file == 'testinfo.json':
                    continue
                    
                file_path = Path(root) / file
                rel_path = file_path.relative_to(test_dir)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                response_data['files'][str(rel_path)] = content
                
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    # Create tests directory if it doesn't exist
    TESTS_DIR.mkdir(exist_ok=True)
    
    # Run the server
    print(f"Starting Central Server on http://localhost:8000")
    print("Available endpoints:")
    print("  POST   /api/tests/create - Create a new test")
    print("  POST   /api/tests/<test_code>/upload - Upload test files")
    print("  GET    /api/tests/<test_code> - Get test information")
    print("  POST   /api/tests/fetch - Fetch test files (for local server)")
    print("  GET    /health - Health check")
    
    run_simple('0.0.0.0', 8000, app, use_reloader=True)
