from pydantic import BaseModel, Field

# ==========================================================
#  ESQUEMAS DE VALIDACIÓN DE DATOS (Pydantic DTOs)
# ==========================================================

class OpinionCreate(BaseModel):
    """
    Esquema para la validación del payload de entrada (Request Body).
    Define y restringe los datos enviados desde el formulario frontend.
    """
    nombre: str = Field(..., min_length=1, max_length=100)
    correo: str  # Validado como cadena de texto básica (formato manejado por regex en JS)
    comentario: str = Field(..., min_length=20)  # Restricción alineada con la validación del frontend
    puntuacion: int = Field(..., ge=1, le=5)    # Restricción numérica: valor entero inclusivo entre 1 y 5


class OpinionResponse(BaseModel):
    """
    Esquema de serialización para las respuestas de la API (Response Body).
    Garantiza una estructura limpia hacia el cliente, incluyendo metadatos del servidor.
    """
    id: int
    nombre: str
    correo: str
    comentario: str
    puntuacion: int
    
    class Config:
        # Habilita el modo de compatibilidad ORM para que Pydantic pueda leer
        # e interactuar directamente con los objetos de SQLAlchemy (modelos de BD)
        from_attributes = True