from flask import Flask, request, jsonify
from vectorization import search_candidates, get_suggestions
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/filieres', methods=['GET'])
def get_filieres():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT id, nom, description FROM filieres ORDER BY nom")
        filieres = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'filieres': filieres
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/search', methods=['POST'])
def search():
    try:
        data = request.json
        
        # Extract search parameters
        description = data.get('description', '')
        tasks = data.get('tasks', '')
        competences = data.get('competences', '')
        filiere_ids = data.get('filiere_ids')
        weights = data.get('weights')
        
        # Perform search using vectorization, pass filiere_ids and weights
        results = search_candidates(description, tasks, competences, filiere_ids=filiere_ids, weights=weights)
        
        return jsonify({
            'status': 'success',
            'results': results,
            'count': len(results)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/suggestions', methods=['GET'])
def suggestions():
    query = request.args.get('query', '')
    field_type = request.args.get('field_type', 'all')
    limit = int(request.args.get('limit', 10))
    try:
        suggestions = get_suggestions(query, field_type, limit)
        return jsonify({'status': 'success', 'suggestions': suggestions})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/cv/<int:cv_id>', methods=['GET'])
def get_cv_details(cv_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get CV basic info
        cursor.execute("SELECT id, date_creation, date_modification FROM cvs WHERE id = %s", (cv_id,))
        cv_info = cursor.fetchone()
        
        if not cv_info:
            return jsonify({
                'status': 'error',
                'message': 'CV not found'
            }), 404
        
        # Get personal information
        cursor.execute("""
            SELECT nom, prenom, localisation, email, telephone, site_web, linkedin, github
            FROM informations_personnelles 
            WHERE id_cv = %s
        """, (cv_id,))
        personal_info = cursor.fetchone()
        
        # Get profile
        cursor.execute("SELECT description FROM profils WHERE id_cv = %s", (cv_id,))
        profile = cursor.fetchone()
        
        # Get formations
        cursor.execute("SELECT * FROM formations WHERE id_cv = %s ORDER BY id DESC", (cv_id,))
        formations = cursor.fetchall()
        
        # Get experiences
        cursor.execute("SELECT * FROM experiences WHERE id_cv = %s ORDER BY id DESC", (cv_id,))
        experiences = cursor.fetchall()
        
        # Get projets
        cursor.execute("SELECT * FROM projets WHERE id_cv = %s", (cv_id,))
        projets = cursor.fetchall()
        
        # Get certificats
        cursor.execute("SELECT * FROM certificats WHERE id_cv = %s", (cv_id,))
        certificats = cursor.fetchall()
        
        # Get competences
        cursor.execute("SELECT * FROM competences WHERE id_cv = %s", (cv_id,))
        competences = cursor.fetchall()
        
        # Get langues
        cursor.execute("SELECT * FROM langues WHERE id_cv = %s", (cv_id,))
        langues = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'cv': {
                'id': cv_info['id'],
                'date_creation': cv_info['date_creation'].isoformat() if cv_info['date_creation'] else None,
                'date_modification': cv_info['date_modification'].isoformat() if cv_info['date_modification'] else None,
                'informations_personnelles': personal_info,
                'profil': profile['description'] if profile else None,
                'formations': formations,
                'experiences': experiences,
                'projets': projets,
                'certificats': certificats,
                'competences': competences,
                'langues': langues
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
