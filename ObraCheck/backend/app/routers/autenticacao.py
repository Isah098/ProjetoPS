
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.autenticacao import LoginRequest, AlterarSenhaRequest
from app.services.autenticacao_service import realizar_login, alterar_senha
from app.dependencies.auth import obter_usuario_atual

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)


@router.post("/login")
def login(
    dados: LoginRequest,
    db: Session = Depends(get_db)
):
    resultado = realizar_login(
        db=db,
        cpf=dados.cpf,
        senha=dados.senha
    )

    if resultado is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CPF ou senha incorretos."
        )

    return resultado

@router.post("/alterar-senha")
def trocar_senha(
    dados: AlterarSenhaRequest,
    usuario = Depends(obter_usuario_atual),
    db: Session = Depends(get_db)
):
    try:
        alterar_senha(
            db=db,
            usuario=usuario,
            senha_atual=dados.senha_atual,
            nova_senha=dados.nova_senha
        )

        return {
            "mensagem": "Senha alterada com sucesso!",
            "precisa_trocar_senha": False
        }

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro)
        )
