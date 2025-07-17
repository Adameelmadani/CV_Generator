from flask import Flask, request, jsonify
from flask_cors import CORS
import cv_ranking
import os
import time

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'cv_craft')
}

# Initialize CV Ranker
ranker = None

def get_ranker():
    global ranker
    if ranker is None:
        ranker = cv_ranking.CVRanker(DB_CONFIG)
        if not ranker.connect_to_db():
            return None
    return ranker

@app.route('/api/rank', methods=['POST'])
def rank_cvs():
    """
    Endpoint to rank CVs based on a query
    
    Expected JSON body:
    {
        "description": "Job description text",
        "taches": "Tasks or company information",
        "competences": "Required skills",
        "method": "embedding" (optional, default: "embedding")
    }
    """
    try:
        # Get the request data
        data = request.json
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
            
        # Required fields
        description = data.get('description', '')
        tasks = data.get('taches', '')
        skills = data.get('competences', '')
        
        if not (description or tasks or skills):
            return jsonify({
                'status': 'error',
                'message': 'At least one search field is required'
            }), 400
            
        # Optional parameters
        method = data.get('method', 'embedding').lower()
        limit = int(data.get('limit', 25))
        
        # Get ranker instance
        ranker_instance = get_ranker()
        if ranker_instance is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to connect to database'
            }), 500
            
        # Start timing
        start_time = time.time()
        
        # Prepare query
        query = {
            'description': description,
            'taches': tasks,
            'competences': skills
        }
        
        # Rank CVs based on method
        if method == 'tf-idf':
            ranked_cvs = ranker_instance.rank_cvs_tf_idf(query)
        elif method == 'cosine':
            ranked_cvs = ranker_instance.rank_cvs_cosine(query)
        elif method == 'tf':
            ranked_cvs = ranker_instance.rank_cvs_tf(query)
        else:  # default to embedding
            ranked_cvs = ranker_instance.rank_cvs_embedding(query)
            
        # Apply limit
        ranked_cvs = ranked_cvs[:limit]
        
        # Calculate execution time
        execution_time = time.time() - start_time
        
        # Return results
        return jsonify({
            'status': 'success',
            'message': 'CV ranking completed successfully',
            'execution_time': execution_time,
            'method': method,
            'total_results': len(ranked_cvs),
            'results': ranked_cvs
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/cv/<int:cv_id>', methods=['GET'])
def get_cv_details(cv_id):
    """
    Get detailed information about a specific CV
    """
    try:
        # Get ranker instance
        ranker_instance = get_ranker()
        if ranker_instance is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to connect to database'
            }), 500
            
        # Get CV sections
        cv_sections = ranker_instance.get_cv_sections(cv_id)
        
        # Get CV info
        cv_info = ranker_instance.get_cv_info(cv_id)
        
        # Check if CV exists
        if not cv_info and not any(cv_sections.values()):
            return jsonify({
                'status': 'error',
                'message': 'CV not found'
            }), 404
            
        # Return combined information
        return jsonify({
            'status': 'success',
            'cv': {
                'id': cv_id,
                'informations_personnelles': cv_info,
                'profile': cv_sections.get('profile', ''),
                'tasks': cv_sections.get('tasks', ''),
                'skills': cv_sections.get('skills', '')
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/search', methods=['POST'])
def search_cvs():
    """
    Advanced search for CVs with filtering
    
    Expected JSON body:
    {
        "keyword": "search term",
        "filters": {
            "ville": "City name",
            "competences_requises": ["skill1", "skill2"]
        },
        "limit": 25,
        "method": "embedding"
    }
    """
    try:
        # Get the request data
        data = request.json
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
            
        # Get search parameters
        keyword = data.get('keyword', '')
        filters = data.get('filters', {})
        method = data.get('method', 'embedding').lower()
        limit = int(data.get('limit', 25))
        
        # Get ranker instance
        ranker_instance = get_ranker()
        if ranker_instance is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to connect to database'
            }), 500
            
        # Start timing
        start_time = time.time()
        
        # Create a query from the keyword and filters
        query = {
            'description': keyword,
            'taches': '',
            'competences': ', '.join(filters.get('competences_requises', []))
        }
        
        # If city filter is provided, add it to the tasks field
        if 'ville' in filters:
            query['taches'] += f" {filters['ville']}"
            
        # Rank CVs based on method
        if method == 'tf-idf':
            ranked_cvs = ranker_instance.rank_cvs_tf_idf(query)
        elif method == 'cosine':
            ranked_cvs = ranker_instance.rank_cvs_cosine(query)
        elif method == 'tf':
            ranked_cvs = ranker_instance.rank_cvs_tf(query)
        else:  # default to embedding
            ranked_cvs = ranker_instance.rank_cvs_embedding(query)
            
        # Apply limit
        ranked_cvs = ranked_cvs[:limit]
        
        # Calculate execution time
        execution_time = time.time() - start_time
        
        # Return results
        return jsonify({
            'status': 'success',
            'message': 'CV search completed successfully',
            'execution_time': execution_time,
            'method': method,
            'query': query,
            'total_results': len(ranked_cvs),
            'results': ranked_cvs
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """
    Get autocomplete suggestions for search fields
    
    Query parameters:
    - query: The search term
    - field: The field type (skills, location, all)
    - limit: Maximum number of suggestions to return
    """
    try:
        # Get query parameters
        query = request.args.get('query', '')
        field_type = request.args.get('field', 'all')
        limit = int(request.args.get('limit', 10))
        
        if not query or len(query) < 2:
            return jsonify({
                'status': 'error',
                'message': 'Query parameter must be at least 2 characters'
            }), 400
            
        # Get ranker instance
        ranker_instance = get_ranker()
        if ranker_instance is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to connect to database'
            }), 500
            
        # Placeholder for actual suggestion logic
        # This would require adding a method to CVRanker to get suggestions
        suggestions = []
        if field_type == 'skills' or field_type == 'all':
            # Add skill suggestions
            skills = ["Python", "Java", "JavaScript", "HTML", "CSS", "PHP", 
                     "SQL", "React", "Angular", "Vue.js", "Node.js",
                     "Django", "Flask", "Spring", "Hibernate", "Docker",
                     "Kubernetes", "AWS", "Azure", "Git", "CI/CD"]
            
            matching_skills = [s for s in skills if query.lower() in s.lower()]
            suggestions.extend(matching_skills[:limit])
            
        if field_type == 'location' or field_type == 'all':
            # Add location suggestions
            locations = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice",
                        "Nantes", "Strasbourg", "Montpellier", "Bordeaux",
                        "Lille", "Rennes", "Reims", "Saint-Etienne", "Toulon",
                        "Grenoble", "Angers", "Dijon", "Nîmes", "Aix-en-Provence"]
                        
            matching_locations = [l for l in locations if query.lower() in l.lower()]
            suggestions.extend(matching_locations[:limit])
            
        # Remove duplicates and limit results
        unique_suggestions = list(dict.fromkeys(suggestions))[:limit]
        
        return jsonify({
            'status': 'success',
            'suggestions': unique_suggestions
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """
    Get API status
    """
    return jsonify({
        'status': 'success',
        'message': 'API is running',
        'version': '1.0.0'
    })

# Run the app
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)