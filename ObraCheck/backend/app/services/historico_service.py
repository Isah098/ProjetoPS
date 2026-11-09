
from sqlalchemy.orm import Session

from app.models.historico import Historico
from app.models.perfil import Perfil


def registrar_historico(
    db: Session,
    usuario,
    acao: str,
    descricao: str = None,
    ocorrencia_id: int = None
):
    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil:
        raise ValueError("Perfil do usuário não encontrado.")

    novo_historico = Historico(
        acao=acao,
        descricao=descricao,
        ocorrencia_id=ocorrencia_id,
        usuario_id=usuario.id,
        perfil=perfil.nome
    )

    db.add(novo_historico)
    db.flush()

    return novo_historico
