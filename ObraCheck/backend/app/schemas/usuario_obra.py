
from pydantic import BaseModel, Field, ConfigDict


class UsuarioObraCriar(BaseModel):
    usuario_id: int = Field(gt=0)
    obra_id: int = Field(gt=0)


class UsuarioObraResposta(BaseModel):
    id: int
    usuario_id: int
    obra_id: int

    model_config = ConfigDict(from_attributes=True)
