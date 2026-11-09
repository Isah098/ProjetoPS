
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HistoricoResposta(BaseModel):
    id: int
    acao: str
    descricao: str | None = None
    ocorrencia_id: int | None = None
    usuario_id: int
    perfil: str
    criada_em: datetime

    model_config = ConfigDict(from_attributes=True)
