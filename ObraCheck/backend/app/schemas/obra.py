
from datetime import date
from pydantic import BaseModel, Field, ConfigDict, model_validator


class ObraCriar(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    endereco: str = Field(min_length=5, max_length=255)
    descricao: str | None = None
    data_inicio: date | None = None
    previsao_termino: date | None = None
    status: str = "em_andamento"

    @model_validator(mode="after")
    def validar_datas(self):
        if (
            self.data_inicio
            and self.previsao_termino
            and self.previsao_termino < self.data_inicio
        ):
            raise ValueError(
                "A previsão de término não pode ser anterior à data de início."
            )
        return self


class ObraResposta(BaseModel):
    id: int
    nome: str
    endereco: str
    descricao: str | None
    data_inicio: date | None
    previsao_termino: date | None
    status: str

    model_config = ConfigDict(from_attributes=True)
