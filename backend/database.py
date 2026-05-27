from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ==========================================================
#  CONFIGURACIÓN DEL MOTOR DE BASE DE DATOS (SQLAlchemy)
# ==========================================================

# String de conexión estructurado para el entorno contenerizado (Network de Docker)
DATABASE_URL = "postgresql://admin:admin@db:5432/bd_comentarios"

# Inicialización del dialecto y pool de conexiones hacia PostgreSQL
engine = create_engine(DATABASE_URL)

# Factoría de sesiones independientes (Session Factory)
# Configurada sin confirmación automática (autocommit) para manejar transacciones explícitas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base declarativa que mapea el registro de entidades ORM
Base = declarative_base()


# ==========================================================
#  INYECTOR DE DEPENDENCIAS (Database Session Lifecycle)
# ==========================================================
def get_db():
    """
    Generador para el manejo del ciclo de vida de las conexiones a la base de datos.
    Garantiza el aislamiento transaccional por cada petición HTTP (Scope por Request).
    """
    db = SessionLocal()
    try:
        yield db  # Cede el control de la sesión al endpoint de la API
    finally:
        db.close()  # Asegura el cierre del socket y la liberación del pool en el servidor