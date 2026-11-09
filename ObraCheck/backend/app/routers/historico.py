
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import obter_usuario_atual
from app.models.historico import Historico
from app.models.perfil import Perfil
from app.schemas.historico import HistoricoResposta


router = APIRouter(
    prefix="/historico",
    tags=["Histórico"]
)


@router.get("/", response_model=list[HistoricoResposta])
def listar_historico(
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

    if perfil.nome != "administrador":
        raise HTTPException(
            status_code=403,
            detail="Somente o administrador pode consultar o histórico."
        )

    return db.query(Historico).order_by(
        Historico.criada_em.desc()
    ).all()
