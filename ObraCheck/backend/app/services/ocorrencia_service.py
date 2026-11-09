
from uuid import uuid4
from sqlalchemy.orm import Session

from app.models.ocorrencia import Ocorrencia
from app.models.obra import Obra
from app.models.usuario import Usuario
from app.models.perfil import Perfil
from app.models.usuario_obra import UsuarioObra


def cadastrar_ocorrencia(
    db: Session,
    descricao: str,
    obra_id: int,
    vistoriador_id: int
):
    # Verifica se o usuário existe e está ativo
    vistoriador = db.query(Usuario).filter(
        Usuario.id == vistoriador_id,
        Usuario.ativo == True
    ).first()

    if not vistoriador:
        raise ValueError("Vistoriador não encontrado ou inativo.")

    # Confere o perfil
    perfil = db.query(Perfil).filter(
        Perfil.id == vistoriador.perfil_id
    ).first()

    if not perfil or perfil.nome != "vistoriador":
        raise ValueError("Somente vistoriadores podem registrar ocorrências.")

    # Verifica se a obra existe
    obra = db.query(Obra).filter(
        Obra.id == obra_id
    ).first()

    if not obra:
        raise ValueError("Obra não encontrada.")

    # Verifica o vínculo
    vinculo = db.query(UsuarioObra).filter(
        UsuarioObra.usuario_id == vistoriador_id,
        UsuarioObra.obra_id == obra_id
    ).first()

    if not vinculo:
        raise ValueError("Vistoriador não vinculado a esta obra.")

    protocolo = f"OC-{uuid4().hex[:12].upper()}"

    nova_ocorrencia = Ocorrencia(
        protocolo=protocolo,
        descricao=descricao,
        obra_id=obra_id,
        vistoriador_id=vistoriador_id,
        status="pendente"
    )

    try:
        db.add(nova_ocorrencia)
        db.flush()
        return nova_ocorrencia

    except Exception:
        db.rollback()
        raise
