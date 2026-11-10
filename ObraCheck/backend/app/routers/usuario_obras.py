
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.usuario_obra import (
    UsuarioObraCriar,
    UsuarioObraResposta
)
from app.services.usuario_obra_service import vincular_usuario_obra
from app.dependencies.auth import exigir_perfil
from app.models.usuario_obra import UsuarioObra

router = APIRouter(
    prefix="/usuario-obras",
    tags=["Vínculos de usuários e obras"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_vinculo(
    dados: UsuarioObraCriar,
    db: Session = Depends(get_db),
    administrador=Depends(exigir_perfil("administrador"))
):
    try:
        vinculo = vincular_usuario_obra(
            db=db,
            usuario_id=dados.usuario_id,
            obra_id=dados.obra_id
        )

        db.commit()
        db.refresh(vinculo)

        return UsuarioObraResposta.model_validate(vinculo)

    except ValueError as erro:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro)
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao vincular usuário à obra."
        )

@router.get("/", response_model=list[UsuarioObraResposta])
def listar_vinculos(
    db: Session = Depends(get_db),
    administrador=Depends(exigir_perfil("administrador"))
):
    return db.query(UsuarioObra).order_by(
        UsuarioObra.id.desc()
    ).all()
