
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.obra import ObraCriar, ObraResposta
from app.services.obra_service import cadastrar_obra
from app.dependencies.auth import exigir_perfil


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

        return ObraResposta.model_validate(obra)

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )
