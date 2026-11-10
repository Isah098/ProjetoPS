
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.models.perfil import Perfil
from app.models.obra import Obra
from app.models.usuario_obra import UsuarioObra


def vincular_usuario_obra(
    db: Session,
    usuario_id: int,
    obra_id: int
):
    # Verifica se o usuário existe
    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise ValueError("Usuário não encontrado.")

    if not usuario.ativo:
        raise ValueError("Este usuário está inativo.")

    # Verifica o perfil do usuário
    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil or perfil.nome not in ("gestor", "vistoriador"):
        raise ValueError(
            "Somente gestores e vistoriadores podem ser vinculados."
        )

    # Verifica se a obra existe
    obra = db.query(Obra).filter(
        Obra.id == obra_id
    ).first()

    if not obra:
        raise ValueError("Obra não encontrada.")

    # Verifica se o vínculo já existe
    vinculo_existente = db.query(UsuarioObra).filter(
        UsuarioObra.usuario_id == usuario_id,
        UsuarioObra.obra_id == obra_id
    ).first()

    if vinculo_existente:
        raise ValueError(
            "Este usuário já está vinculado a esta obra."
        )

    # Cria o vínculo
    novo_vinculo = UsuarioObra(
        usuario_id=usuario_id,
        obra_id=obra_id
    )

    
    db.add(novo_vinculo)
    db.flush()

    return novo_vinculo

