
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.models.perfil import Perfil
from app.core.security import verificar_senha
from app.core.auth import criar_token_acesso


def realizar_login(
    db: Session,
    cpf: str,
    senha: str
):
    # Procura o usuário pelo CPF
    usuario = db.query(Usuario).filter(
        Usuario.cpf == cpf
    ).first()

    # Verifica se o usuário existe e está ativo
    if not usuario or not usuario.ativo:
        return None

    # Verifica a senha
    if not verificar_senha(senha, usuario.senha_hash):
        return None

    # Busca o perfil do usuário
    perfil = db.query(Perfil).filter(
        Perfil.id == usuario.perfil_id
    ).first()

    if not perfil:
        return None

    # Gera o token de autenticação
    token = criar_token_acesso(
        usuario_id=usuario.id,
        perfil=perfil.nome
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "precisa_trocar_senha": usuario.precisa_trocar_senha,
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "cpf": usuario.cpf,
            "perfil": perfil.nome
        }
    }

def alterar_senha(
    db: Session,
    usuario: Usuario,
    senha_atual: str,
    nova_senha: str
):
    # Confere a senha atual
    if not verificar_senha(senha_atual, usuario.senha_hash):
        raise ValueError("A senha atual está incorreta.")

    # Impede reutilizar a mesma senha
    if verificar_senha(nova_senha, usuario.senha_hash):
        raise ValueError("A nova senha deve ser diferente da atual.")

    # Gera o hash da nova senha
    from app.core.security import gerar_hash_senha

    usuario.senha_hash = gerar_hash_senha(nova_senha)

    # Marca que a troca inicial foi realizada
    usuario.precisa_trocar_senha = False

    db.commit()
    db.refresh(usuario)

    return True
