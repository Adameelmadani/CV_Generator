
import os
import json
import logging
from typing import List, Dict, Any, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS

from structured_search import StructuredSearchEngine

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize the search engine
search_engine = StructuredSearchEngine()

@app.route('/api/search', methods=['POST'])
def search_cvs():
    """API endpoint for structured CV search"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract query fields
        description = data.get('description', '')
        tasks = data.get('tasks', '')
        competences = data.get('competences', '')
        
        # Extract optional parameters
        filiere_ids = data.get('filiere_ids', None)
        top_n = data.get('top_n', 10)
        weights = data.get('weights', None)
        
        # Update weights if provided
        if weights:
            search_engine.set_weights(weights)
        
        # Perform search
        results = search_engine.search(
            description=description,
            tasks=tasks,
            competences=competences,
            filiere_ids=filiere_ids,
            top_n=top_n
        )
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cv/<int:cv_id>', methods=['GET'])
def get_cv_details(cv_id):
    """API endpoint to get detailed CV information"""
    try:
        cv_details = search_engine.get_cv_details(cv_id)
        
        if cv_details:
            return jsonify({
                'success': True,
                'cv': cv_details
            })
        else:
            return jsonify({'error': 'CV not found'}), 404
            
    except Exception as e:
        logger.error(f"Error fetching CV: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)