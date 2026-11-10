
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.models.perfil import Perfil
from app.core.security import (
    gerar_senha_inicial,
    gerar_hash_senha
)


def cadastrar_usuario(
    db: Session,
    nome: str,
    cpf: str,
    perfil_id: int
):
    # Verifica se o CPF já está cadastrado
    usuario_existente = db.query(Usuario).filter(
        Usuario.cpf == cpf
    ).first()

    if usuario_existente:
        raise ValueError("Este CPF já está cadastrado.")

    # Verifica se o perfil existe
    perfil = db.query(Perfil).filter(
        Perfil.id == perfil_id
    ).first()

    if not perfil:
        raise ValueError("Perfil não encontrado.")

    # Gera a senha inicial
    senha_inicial = gerar_senha_inicial()

    # Cria o usuário
    novo_usuario = Usuario(
        nome=nome,
        cpf=cpf,
        senha_hash=gerar_hash_senha(senha_inicial),
        perfil_id=perfil_id,
        ativo=True,
        precisa_trocar_senha=True
    )

    db.add(novo_usuario)
    db.flush()

    # Retorna o usuário e a senha inicial
    return novo_usuario, senha_inicial
