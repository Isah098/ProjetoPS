
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    cpf: str = Field(min_length=11, max_length=11)
    senha: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    precisa_trocar_senha: bool
    usuario: dict


class AlterarSenhaRequest(BaseModel):
    senha_atual: str = Field(min_length=1, max_length=128)
    nova_senha: str = Field(min_length=8, max_length=128)
