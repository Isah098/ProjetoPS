
from pydantic import BaseModel, Field, field_validator
import re


class UsuarioBase(BaseModel):
    nome: str = Field(min_length=3, max_length=150)

    cpf: str = Field(min_length=11, max_length=11)

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, valor):
        cpf = re.sub(r"\D", "", valor)

        if len(cpf) != 11:
            raise ValueError("O CPF deve conter 11 números.")

        if cpf == cpf[0] * 11:
            raise ValueError("CPF inválido.")

        return cpf


class UsuarioCriar(UsuarioBase):
    perfil_id: int = Field(gt=0)


class UsuarioResposta(UsuarioBase):
    id: int
    perfil_id: int
    ativo: bool
    precisa_trocar_senha: bool

    model_config = {"from_attributes": True}
