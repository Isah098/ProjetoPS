
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.obra import ObraCriar, ObraResposta
from app.services.obra_service import cadastrar_obra
from app.dependencies.auth import exigir_perfil
from app.models.obra import Obra
from app.models.perfil import Perfil
from app.models.usuario_obra import UsuarioObra
from app.dependencies.auth import obter_usuario_atual

router = APIRouter(
    prefix="/obras",
    tags=["Obras"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_obra(
    dados: ObraCriar,
    db: Session = Depends(get_db),
    administrador=Depends(exigir_perfil("administrador"))
):
    try:
        obra = cadastrar_obra(
            db=db,
            nome=dados.nome,
            endereco=dados.endereco,
            descricao=dados.descricao,
            data_inicio=dados.data_inicio,
            previsao_termino=dados.previsao_termino,
            status=dados.status
        )

        db.commit()
        db.refresh(obra)

        return ObraResposta.model_validate(obra)

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
            detail="Erro ao cadastrar obra."
        )

@router.get("/", response_model=list[ObraResposta])
def listar_obras(
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil:
        raise HTTPException(
            status_code=403,
            detail="Perfil não encontrado."
        )

    consulta = db.query(Obra)

    if perfil.nome == "administrador":
        pass

    elif perfil.nome in ("gestor", "vistoriador"):
        obras_vinculadas = db.query(
            UsuarioObra.obra_id
        ).filter(
            UsuarioObra.usuario_id == usuario.id
        ).subquery()

        consulta = consulta.filter(
            Obra.id.in_(obras_vinculadas)
        )

    else:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para consultar obras."
        )

    return consulta.order_by(Obra.id.desc()).all()
