
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.usuario import UsuarioCriar, UsuarioResposta
from app.services.usuario_service import cadastrar_usuario
from app.dependencies.auth import exigir_perfil


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_usuario(
    dados: UsuarioCriar,
    db: Session = Depends(get_db),
    administrador=Depends(exigir_perfil("administrador"))
):
    try:
        from app.models.perfil import Perfil

        perfil = db.query(Perfil).filter(
            Perfil.id == dados.perfil_id
        ).first()

        if not perfil or perfil.nome not in ("gestor", "vistoriador"):
            raise HTTPException(
                status_code=400,
                detail="Só é permitido cadastrar gestores e vistoriadores."
            )

        usuario, senha_inicial = cadastrar_usuario(
            db=db,
            nome=dados.nome,
            cpf=dados.cpf,
            perfil_id=dados.perfil_id
        )

        db.commit()
        db.refresh(usuario)

        return {
            "mensagem": "Usuário cadastrado com sucesso!",
            "usuario": UsuarioResposta.model_validate(usuario),
            "senha_inicial": senha_inicial
        }

    
    except HTTPException:
        db.rollback()
        raise

    except ValueError as erro:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao cadastrar usuário."
        )

