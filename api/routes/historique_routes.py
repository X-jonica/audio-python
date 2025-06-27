from flask import Blueprint, request, jsonify
from models.models import db, History
from datetime import datetime

historique_bp = Blueprint('historique', __name__)

# Ajouter un historique
@historique_bp.route('/history', methods=['POST'])
def add_history():
    data = request.get_json()

    title = data.get('title')
    paroles = data.get('paroles')
    user_id = data.get('user_id')

    if not title or not paroles or not user_id:
        return jsonify({"error": "Tous les champs sont requis"}), 400

    history = History(
        title=title,
        paroles=paroles,
        user_id=user_id,
        date_search=datetime.utcnow()
    )

    db.session.add(history)
    db.session.commit()

    return jsonify({"message": "Ajout réussi"}), 201


# Récupérer les historiques d’un utilisateur
@historique_bp.route('/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    histories = History.query.filter_by(user_id=user_id).order_by(History.date_search.desc()).all()

    result = [{
        "title": h.title,
        "paroles": h.paroles,
        "date": h.date_search.strftime("%Y-%m-%d %H:%M:%S")
    } for h in histories]

    return jsonify(result)


# Supprimer un historique par son ID
@historique_bp.route('/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    history = History.query.get(history_id)

    if not history:
        return jsonify({"error": "Historique non trouvé"}), 404

    db.session.delete(history)
    db.session.commit()

    return jsonify({"message": "Historique supprimé avec succès"})
