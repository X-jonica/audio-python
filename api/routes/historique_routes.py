from flask import Blueprint, request, jsonify
from models.models import db, Historique

historique_bp = Blueprint('historique', __name__)

@historique_bp.route('/historique', methods=['POST'])
def add_historique():
    data = request.get_json()
    historique = Historique(
        titre=data['titre'],
        paroles=data['paroles'],
        utilisateur_id=data['utilisateur_id']
    )
    db.session.add(historique)
    db.session.commit()
    return jsonify({"message": "Ajout réussi"})

@historique_bp.route('/historique/<int:user_id>', methods=['GET'])
def get_historique(user_id):
    historiques = Historique.query.filter_by(utilisateur_id=user_id).all()
    result = [{
        "titre": h.titre,
        "paroles": h.paroles,
        "date": h.date_recherche
    } for h in historiques]
    return jsonify(result)

# Nouvelle route pour supprimer une entrée d'historique par son id
@historique_bp.route('/historique/<int:historique_id>', methods=['DELETE'])
def delete_historique(historique_id):
    historique = Historique.query.get(historique_id)
    if not historique:
        return jsonify({"error": "Historique non trouvé"}), 404
    db.session.delete(historique)
    db.session.commit()
    return jsonify({"message": "Historique supprimé avec succès"})