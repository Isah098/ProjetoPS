
from datetime import datetime, timedelta, timezone

import jwt

from app.config import settings


ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 30


def criar_token_acesso(usuario_id: int, perfil: str) -> str:
    agora = datetime.now(timezone.utc)

    dados = {
        "sub": str(usuario_id),
        "perfil": perfil,
        "iat": agora,
        "exp": agora + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }

    return jwt.encode(
        dados,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )


def verificar_token(token: str):
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except jwt.InvalidTokenError:
        return None
