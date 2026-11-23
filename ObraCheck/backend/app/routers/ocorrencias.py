
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.ocorrencia import Ocorrencia
from app.models.perfil import Perfil
from app.models.usuario_obra import UsuarioObra
from app.database import get_db
from app.schemas.ocorrencia import (
    OcorrenciaCriar,
    OcorrenciaResposta,
    OcorrenciaStatusAtualizar
)
from app.services.ocorrencia_service import cadastrar_ocorrencia
from app.dependencies.auth import obter_usuario_atual
from app.services.historico_service import registrar_historico

router = APIRouter(
    prefix="/ocorrencias",
    tags=["Ocorrências"]
)




@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_ocorrencia(
    dados: OcorrenciaCriar,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    try:
        ocorrencia = cadastrar_ocorrencia(
            db=db,
            descricao=dados.descricao,
            obra_id=dados.obra_id,
            vistoriador_id=usuario.id
        )

        registrar_historico(
            db=db,
            usuario=usuario,
            acao="Criar ocorrência",
            descricao=(
                f"Usuário {usuario.nome} registrou "
                f"uma ocorrência na obra {ocorrencia.obra_id}."
            ),
            ocorrencia_id=ocorrencia.id
        )

        # Confirma ocorrência e histórico juntos
        db.commit()
        db.refresh(ocorrencia)

        return OcorrenciaResposta.model_validate(ocorrencia)

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
            detail="Erro ao registrar ocorrência e histórico."
        )

@router.get("/", response_model=list[OcorrenciaResposta])
def listar_ocorrencias(
    obra_id: int | None = None,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    # Identifica o perfil do usuário
    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil:
        raise HTTPException(
            status_code=403,
            detail="Perfil não encontrado."
        )

    # Consulta inicial
    consulta = db.query(Ocorrencia)

    # Administrador pode consultar todas as ocorrências
    if perfil.nome == "administrador":
        pass

    # Gestores e vistoriadores consultam somente
    # as ocorrências das obras às quais estão vinculados
    elif perfil.nome in ("gestor", "vistoriador"):

        obras_vinculadas = db.query(
            UsuarioObra.obra_id
        ).filter(
            UsuarioObra.usuario_id == usuario.id
        ).subquery()

        consulta = consulta.filter(
            Ocorrencia.obra_id.in_(obras_vinculadas)
        )

    else:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para consultar ocorrências."
        )

    # Filtro opcional por obra
    if obra_id is not None:
        if obra_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="ID da obra inválido."
            )

        consulta = consulta.filter(
            Ocorrencia.obra_id == obra_id
        )

    return consulta.order_by(
        Ocorrencia.criada_em.desc()
    ).all()

@router.patch("/{ocorrencia_id}/status")
def atualizar_status_ocorrencia(
    ocorrencia_id: int,
    dados: OcorrenciaStatusAtualizar,
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

    if perfil.nome not in ("administrador", "gestor"):
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para alterar o status."
        )

    ocorrencia = db.query(Ocorrencia).filter(
        Ocorrencia.id == ocorrencia_id
    ).first()

    if not ocorrencia:
        raise HTTPException(
            status_code=404,
            detail="Ocorrência não encontrada."
        )

    if perfil.nome == "gestor":
        vinculo = db.query(UsuarioObra).filter(
            UsuarioObra.usuario_id == usuario.id,
            UsuarioObra.obra_id == ocorrencia.obra_id
        ).first()

        if not vinculo:
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a esta obra."
            )

    status_permitidos = (
        "pendente",
        "em_analise",
        "resolvida",
        "cancelada"
    )

    novo_status = dados.status.strip().lower()

    if novo_status not in status_permitidos:
        raise HTTPException(
            status_code=400,
            detail="Status inválido."
        )

    status_anterior = ocorrencia.status

    if status_anterior == novo_status:
        raise HTTPException(
            status_code=400,
            detail="A ocorrência já possui esse status."
        )
    try:
        ocorrencia.status = novo_status

        registrar_historico(
            db=db,
            usuario=usuario,
            acao="Alterar status da ocorrência",
            descricao=(
                f"O usuário {usuario.nome} alterou o status "
                f"de {status_anterior} para {novo_status}."
            ),
            ocorrencia_id=ocorrencia.id
        )

        # Confirma a alteração e o histórico juntos
        db.commit()
        db.refresh(ocorrencia)

        return OcorrenciaResposta.model_validate(ocorrencia)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao atualizar status e registrar histórico."
        )



from pydantic import BaseModel, Field
from app.models.historico import Historico

class ObservacaoCriar(BaseModel):
    texto: str = Field(min_length=1, max_length=5000)

@router.post("/{ocorrencia_id}/observacoes", status_code=201)
def registrar_observacao(ocorrencia_id: int, dados: ObservacaoCriar, db: Session = Depends(get_db), usuario=Depends(obter_usuario_atual)):
    ocorrencia = db.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(404, "Ocorrência não encontrada.")
    perfil = db.get(Perfil, usuario.perfil_id)
    if not perfil or perfil.nome not in ("gestor", "administrador"):
        raise HTTPException(403, "Somente gestores e administradores podem registrar análises.")
    if perfil.nome == "gestor" and not db.query(UsuarioObra).filter_by(usuario_id=usuario.id, obra_id=ocorrencia.obra_id).first():
        raise HTTPException(403, "Sem acesso à obra.")
    registrar_historico(db=db, usuario=usuario, acao="Observação da ocorrência", descricao=dados.texto, ocorrencia_id=ocorrencia_id)
    db.commit()
    return {"mensagem": "Observação registrada."}

@router.get("/{ocorrencia_id}/observacoes")
def consultar_observacoes(ocorrencia_id: int, db: Session = Depends(get_db), usuario=Depends(obter_usuario_atual)):
    ocorrencia = db.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(404, "Ocorrência não encontrada.")
    perfil = db.get(Perfil, usuario.perfil_id)
    if not perfil or (perfil.nome != "administrador" and not db.query(UsuarioObra).filter_by(usuario_id=usuario.id, obra_id=ocorrencia.obra_id).first()):
        raise HTTPException(403, "Sem acesso à obra.")
    return [{"id": h.id, "texto": h.descricao, "data": h.criada_em.isoformat() if h.criada_em else None} for h in db.query(Historico).filter_by(ocorrencia_id=ocorrencia_id, acao="Observação da ocorrência").order_by(Historico.id).all()]
