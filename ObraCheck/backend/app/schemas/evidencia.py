
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EvidenciaResposta(BaseModel):
    id: int
    nome_arquivo: str
    tipo_arquivo: str
    tamanho_bytes: int
    ocorrencia_id: int
    enviada_em: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
