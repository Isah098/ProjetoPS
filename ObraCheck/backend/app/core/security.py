
import secrets
import string

from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


def gerar_senha_inicial(tamanho: int = 12) -> str:
    """Gera uma senha temporária aleatória."""

    caracteres = string.ascii_letters + string.digits + "!@#$%&*"

    return "".join(
        secrets.choice(caracteres)
        for _ in range(tamanho)
    )


def gerar_hash_senha(senha: str) -> str:
    """Transforma a senha em um hash seguro."""

    return password_hash.hash(senha)


def verificar_senha(
    senha_digitada: str,
    senha_hash: str
) -> bool:
    """Confere se a senha corresponde ao hash armazenado."""

    return password_hash.verify(senha_digitada, senha_hash)
