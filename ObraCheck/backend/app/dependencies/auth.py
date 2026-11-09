
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.perfil import Perfil
from app.core.auth import verificar_token


bearer_scheme = HTTPBearer()


def obter_usuario_atual(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    dados = verificar_token(credentials.credentials)

    if not dados:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado."
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == int(dados["sub"])
    ).first()

    if not usuario or not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo."
        )

    return usuario


def exigir_perfil(*perfis_permitidos):
    def verificar_perfil(
        usuario: Usuario = Depends(obter_usuario_atual),
        db: Session = Depends(get_db)
    ):
        perfil = db.query(Perfil).filter(
            Perfil.id == usuario.perfil_id
        ).first()

        if not perfil or perfil.nome not in perfis_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar este recurso."
            )

        return usuario

    return verificar_perfil
