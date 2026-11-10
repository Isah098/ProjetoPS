import logging
logger = logging.getLogger(__name__)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import obter_usuario_atual
from app.schemas.evidencia import EvidenciaResposta
from app.services.evidencia_service import cadastrar_evidencia
from app.models.ocorrencia import Ocorrencia
from app.models.usuario_obra import UsuarioObra
from app.models.perfil import Perfil
from app.models.evidencia import Evidencia
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi.responses import Response
from app.services.historico_service import registrar_historico

router = APIRouter(
    prefix="/evidencias",
    tags=["Evidências"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def enviar_evidencia(
    ocorrencia_id: int = Form(...),
    arquivo: UploadFile = File(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    ocorrencia = db.query(Ocorrencia).filter(
        Ocorrencia.id == ocorrencia_id
    ).first()

    if not ocorrencia:
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada."
        )

    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil:
        raise HTTPException(
            status_code=403,
            detail="Perfil não encontrado."
        )

    if perfil.nome == "vistoriador":
        vinculo = db.query(UsuarioObra).filter(
            UsuarioObra.usuario_id == usuario.id,
            UsuarioObra.obra_id == ocorrencia.obra_id
        ).first()

        if not vinculo or ocorrencia.vistoriador_id != usuario.id:
            raise HTTPException(
                status_code=403,
                detail="Você não pode anexar evidências a esta ocorrência."
            )

    elif perfil.nome == "gestor":
        vinculo = db.query(UsuarioObra).filter(
            UsuarioObra.usuario_id == usuario.id,
            UsuarioObra.obra_id == ocorrencia.obra_id
        ).first()

        if not vinculo:
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a esta obra."
            )

    elif perfil.nome != "administrador":
        raise HTTPException(
            status_code=403,
            detail="Perfil sem permissão para enviar evidências."
        )
    
    evidencia = None

    try:
        evidencia = await cadastrar_evidencia(
            db=db,
            arquivo=arquivo,
            ocorrencia_id=ocorrencia_id,
            latitude=latitude,
            longitude=longitude
        )

        registrar_historico(
            db=db,
            usuario=usuario,
            acao="Enviar evidência",
            descricao=(
                f"O usuário {usuario.nome} enviou o arquivo "
                f"{evidencia.nome_arquivo} para a ocorrência "
                f"{ocorrencia_id}."
            ),
            ocorrencia_id=ocorrencia_id
        )

        db.commit()
        db.refresh(evidencia)

        return EvidenciaResposta.model_validate(evidencia)

    except ValueError as erro:
        db.rollback()

        if evidencia:
            caminho = Path(evidencia.caminho_arquivo)
            if caminho.is_file():
                caminho.unlink()

        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )

    except Exception:
        db.rollback()

        if evidencia:
            caminho = Path(evidencia.caminho_arquivo)
            if caminho.is_file():
                caminho.unlink()

        raise HTTPException(
            status_code=500,
            detail="Erro ao registrar evidência e histórico."
        )


    
@router.get(
    "/ocorrencia/{ocorrencia_id}",
    response_model=list[EvidenciaResposta]
)
def listar_evidencias(
    ocorrencia_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    # Localiza a ocorrência
    ocorrencia = db.query(Ocorrencia).filter(
        Ocorrencia.id == ocorrencia_id
    ).first()

    if not ocorrencia:
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada."
        )

    # Identifica o perfil
    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil:
        raise HTTPException(
            status_code=403,
            detail="Perfil não encontrado."
        )

    # Verifica permissões
    if perfil.nome == "administrador":
        pass

    elif perfil.nome in ("gestor", "vistoriador"):

        vinculo = db.query(UsuarioObra).filter(
            UsuarioObra.usuario_id == usuario.id,
            UsuarioObra.obra_id == ocorrencia.obra_id
        ).first()

        if not vinculo:
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a esta obra."
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para consultar evidências."
        )

    # Busca as evidências
    evidencias = db.query(Evidencia).filter(
        Evidencia.ocorrencia_id == ocorrencia_id
    ).order_by(
        Evidencia.enviada_em.desc()
    ).all()

    return evidencias

@router.get("/{evidencia_id}/arquivo")
def baixar_evidencia(
    evidencia_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    evidencia = db.query(Evidencia).filter(
        Evidencia.id == evidencia_id
    ).first()

    if not evidencia:
        raise HTTPException(
            status_code=404,
            detail="Evidência não encontrada."
        )

    ocorrencia = db.query(Ocorrencia).filter(
        Ocorrencia.id == evidencia.ocorrencia_id
    ).first()

    if not ocorrencia:
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada."
        )

    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil:
        raise HTTPException(
            status_code=403,
            detail="Perfil não encontrado."
        )

    if perfil.nome == "administrador":
        pass

    elif perfil.nome in ("gestor", "vistoriador"):
        vinculo = db.query(UsuarioObra).filter(
            UsuarioObra.usuario_id == usuario.id,
            UsuarioObra.obra_id == ocorrencia.obra_id
        ).first()

        if not vinculo:
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a esta obra."
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para baixar evidências."
        )

    caminho = Path(evidencia.caminho_arquivo)

    if not caminho.is_file():
        raise HTTPException(
            status_code=404,
            detail="Arquivo não encontrado no armazenamento."
        )

    return FileResponse(
        path=str(caminho),
        filename=evidencia.nome_arquivo,
        media_type=evidencia.tipo_arquivo
    )

@router.delete(
    "/{evidencia_id}",
    status_code=status.HTTP_204_NO_CONTENT
)

def excluir_evidencia(
    evidencia_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    # Verifica o perfil
    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil or perfil.nome != "administrador":
        raise HTTPException(
            status_code=403,
            detail="Somente o administrador pode excluir evidências."
        )

    # Localiza a evidência
    evidencia = db.query(Evidencia).filter(
        Evidencia.id == evidencia_id
    ).first()

    if not evidencia:
        raise HTTPException(
            status_code=404,
            detail="Evidência não encontrada."
        )

    # Confere se o arquivo está dentro da pasta uploads
    pasta_uploads = Path("uploads").resolve()
    caminho = Path(evidencia.caminho_arquivo).resolve()

    if not caminho.is_relative_to(pasta_uploads):
        raise HTTPException(
            status_code=400,
            detail="Caminho de arquivo inválido."
        )
    try:
        registrar_historico(
            db=db,
            usuario=usuario,
            acao="Excluir evidência",
            descricao=(
                f"O administrador {usuario.nome} excluiu "
                f"o arquivo {evidencia.nome_arquivo} "
                f"da ocorrência {evidencia.ocorrencia_id}."
            ),
            ocorrencia_id=evidencia.ocorrencia_id
        )

        db.delete(evidencia)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao excluir evidência e registrar histórico."
        )

    # Remove o arquivo físico somente após o commit
    try:
        if caminho.is_file():
            caminho.unlink()

    except OSError:
        logger.exception(
            "Falha ao remover o arquivo físico da evidência %s. "
            "Caminho: %s",
            evidencia_id,
            caminho
        )

    return Response(status_code=204)
