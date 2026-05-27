from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

# ==========================================================
#  MODELOS DE PERSISTENCIA (SQLAlchemy ORM)
# ==========================================================

class Opinion(Base):
    """
    Definición de la entidad 'Opinion' y su mapeo directo 
    con la tabla física en la base de datos PostgreSQL.
    """
    __tablename__ = "opiniones"

    # Llave primaria autoincrementable e indexada para optimización de búsquedas
    id = Column(Integer, primary_key=True, index=True)
    
    # Restricciones de longitud y obligatoriedad (NOT NULL) a nivel de esquema de BD
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), nullable=False)
    comentario = Column(Text, nullable=False)
    puntuacion = Column(Integer, nullable=False)
    
    # Auditoría temporal: asigna la marca de tiempo exacta en el servidor al insertar el registro
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)