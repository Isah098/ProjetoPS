
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class OcorrenciaCriar(BaseModel):
    descricao: str = Field(min_length=10)
    obra_id: int = Field(gt=0)


class OcorrenciaStatusAtualizar(BaseModel):
    status: str = Field(
        min_length=1,
        max_length=30
    )


class OcorrenciaResposta(BaseModel):
    id: int
    protocolo: str
    descricao: str
    status: str
    obra_id: int
    vistoriador_id: int
    criada_em: datetime | None = None
    atualizada_em: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
