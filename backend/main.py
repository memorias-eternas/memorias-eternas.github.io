from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db
import models
import schemas

# ==========================================================
#  INICIALIZACIÓN DEL ENTORNO Y CONFIGURACIONES CENTRALES
# ==========================================================

# Motor de migración automática: Genera las tablas en el motor relacional si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Opiniones - SFME")

# Configuración del Middleware CORS (Cross-Origin Resource Sharing)
# Permite la comunicación inter-orígenes de forma abierta para entornos de desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
#  ENDPOINTS / RUTAS DE LA API REST
# ==========================================================

@app.get("/")
def inicio():
    """Endpoint de verificación de estado (Health Check)."""
    return {"status": "Servidor corriendo correctamente"}


@app.post("/api/opiniones", response_model=schemas.OpinionResponse, status_code=201)
def crear_opinion(opinion: schemas.OpinionCreate, db: Session = Depends(get_db)):
    """
    Inserción y persistencia de datos (POST).
    Recibe un objeto validado DTO, inicia una transacción en el ORM, 
    confirma el cambio (Commit) y retorna la entidad serializada.
    """
    # Mapeo de datos del esquema de entrada al modelo relacional de SQLAlchemy
    nueva_opinion = models.Opinion(
        nombre=opinion.nombre,
        correo=opinion.correo,
        comentario=opinion.comentario,
        puntuacion=opinion.puntuacion
    )
    
    db.add(nueva_opinion)      # Registra la operación en la transacción actual
    db.commit()               # Confirma los cambios físicamente en PostgreSQL (Commit)
    db.refresh(nueva_opinion)  # Recupera el ID y la fecha generados nativamente por el motor
    
    return nueva_opinion


@app.get("/api/opiniones", response_model=List[schemas.OpinionResponse])
def obtener_opiniones(db: Session = Depends(get_db)):
    """
    Consulta general de registros (GET).
    Realiza una consulta ordenada de forma ascendente según la clave primaria 
    para garantizar la consistencia en el flujo secuencial del renderizado frontend.
    """
    opiniones = db.query(models.Opinion).order_by(models.Opinion.id.asc()).all()
    return opiniones