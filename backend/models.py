from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Evento(db.Model):
    __tablename__ = 'eventos'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    fecha = db.Column(db.String(50), nullable=False)
    lugar = db.Column(db.String(150), nullable=False)
    cupo_maximo = db.Column(db.Integer, nullable=False, default=0)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "fecha": self.fecha,
            "lugar": self.lugar,
            "cupo_maximo": self.cupo_maximo
        }


class Participante(db.Model):
    __tablename__ = 'participantes'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    correo = db.Column(db.String(150), nullable=False, unique=True)
    codigo = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "correo": self.correo,
            "codigo": self.codigo
        }


class Inscripcion(db.Model):
    __tablename__ = 'inscripciones'
    
    id = db.Column(db.Integer, primary_key=True)
    evento_id = db.Column(db.Integer, db.ForeignKey('eventos.id'), nullable=False)
    participante_id = db.Column(db.Integer, db.ForeignKey('participantes.id'), nullable=False)
    fecha_inscripcion = db.Column(db.DateTime, default=datetime.utcnow)

    evento = db.relationship('Evento', backref='inscripciones')
    participante = db.relationship('Participante', backref='inscripciones')

    def to_dict(self):
        return {
            "id": self.id,
            "evento_id": self.evento_id,
            "participante_id": self.participante_id,
            "participante": self.participante.to_dict() if self.participante else None
        }