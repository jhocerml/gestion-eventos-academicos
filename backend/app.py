from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Evento, Participante, Inscripcion

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eventos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

with app.app_context():
    db.create_all()


# ---------- EVENTOS ----------

@app.route('/api/eventos', methods=['GET'])
def listar_eventos():
    eventos = Evento.query.all()
    return jsonify([e.to_dict() for e in eventos])


@app.route('/api/eventos/<int:id>', methods=['GET'])
def obtener_evento(id):
    evento = Evento.query.get_or_404(id)
    return jsonify(evento.to_dict())


@app.route('/api/eventos', methods=['POST'])
def crear_evento():
    data = request.get_json()
    nuevo = Evento(
        nombre=data.get('nombre'),
        descripcion=data.get('descripcion'),
        fecha=data.get('fecha'),
        lugar=data.get('lugar'),
        cupo_maximo=data.get('cupo_maximo', 0)
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.to_dict()), 201


@app.route('/api/eventos/<int:id>', methods=['PUT'])
def actualizar_evento(id):
    evento = Evento.query.get_or_404(id)
    data = request.get_json()
    evento.nombre = data.get('nombre', evento.nombre)
    evento.descripcion = data.get('descripcion', evento.descripcion)
    evento.fecha = data.get('fecha', evento.fecha)
    evento.lugar = data.get('lugar', evento.lugar)
    evento.cupo_maximo = data.get('cupo_maximo', evento.cupo_maximo)
    db.session.commit()
    return jsonify(evento.to_dict())


@app.route('/api/eventos/<int:id>', methods=['DELETE'])
def eliminar_evento(id):
    evento = Evento.query.get_or_404(id)
    db.session.delete(evento)
    db.session.commit()
    return jsonify({"mensaje": "Evento eliminado"})


#---------- PARTICIPANTES ----------

@app.route('/api/participantes', methods=['GET'])
def listar_participantes():
    participantes = Participante.query.all()
    return jsonify([p.to_dict() for p in participantes])


@app.route('/api/participantes/<int:id>', methods=['DELETE'])
def eliminar_participante(id):
    participante = Participante.query.get_or_404(id)
    db.session.delete(participante)
    db.session.commit()
    return jsonify({"mensaje": "Participante eliminado"})


@app.route('/api/participantes', methods=['POST'])
def crear_participante():
    data = request.get_json()
    nuevo = Participante(
        nombre=data.get('nombre'),
        correo=data.get('correo'),
        codigo=data.get('codigo')
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.to_dict()), 201

# ---------- INSCRIPCIONES ----------

@app.route('/api/inscripciones', methods=['POST'])
def inscribir_participante():
    data = request.get_json()
    evento_id = data.get('evento_id')
    participante_id = data.get('participante_id')


    # Verificar si ya existe esa inscripción
    existente = Inscripcion.query.filter_by(
        evento_id=evento_id,
        participante_id=participante_id
    ).first()

    if existente:
        return jsonify({"error": "Este participante ya está inscrito en este evento"}), 409

    nueva = Inscripcion(
        evento_id=evento_id,
        participante_id=participante_id
    )
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.to_dict()), 201

@app.route('/api/inscripciones/<int:id>', methods=['DELETE'])
def eliminar_inscripcion(id):
    inscripcion = Inscripcion.query.get_or_404(id)
    db.session.delete(inscripcion)
    db.session.commit()
    return jsonify({"mensaje": "Inscripción eliminada"})


@app.route('/api/eventos/<int:id>/inscritos', methods=['GET'])
def ver_inscritos(id):
    inscripciones = Inscripcion.query.filter_by(evento_id=id).all()
    return jsonify([i.to_dict() for i in inscripciones])


if __name__ == '__main__':
    app.run(debug=True, port=5000)