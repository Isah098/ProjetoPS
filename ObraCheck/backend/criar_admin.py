
import re

from app.database import SessionLocal
from app.models.usuario import Usuario
from app.models.perfil import Perfil
from app.core.security import (
    gerar_senha_inicial,
    gerar_hash_senha
)


db = SessionLocal()

try:
    # Verifica se já existe administrador
    perfil = db.query(Perfil).filter(
        Perfil.nome == "administrador"
    ).first()

    if perfil:
        administrador_existente = db.query(Usuario).filter(
            Usuario.perfil_id == perfil.id
        ).first()

        if administrador_existente:
            print("Já existe um administrador cadastrado.")
            raise SystemExit

    nome = input("Nome do administrador: ").strip()
    cpf = re.sub(r"\D", "", input("CPF (somente números): "))

    if len(nome) < 3:
        raise ValueError("Nome inválido.")

    if len(cpf) != 11 or cpf == cpf[0] * 11:
        raise ValueError("CPF inválido.")

    existente = db.query(Usuario).filter(
        Usuario.cpf == cpf
    ).first()

    if existente:
        raise ValueError("Este CPF já está cadastrado.")

    if not perfil:
        perfil = Perfil(nome="administrador")
        db.add(perfil)
        db.flush()

    senha = gerar_senha_inicial()

    administrador = Usuario(
        nome=nome,
        cpf=cpf,
        senha_hash=gerar_hash_senha(senha),
        perfil_id=perfil.id,
        ativo=True,
        precisa_trocar_senha=True
    )

    db.add(administrador)
    db.commit()

    print("\nAdministrador cadastrado com sucesso!")
    print("CPF:", cpf)
    print("Senha inicial:", senha)
    print("Troca de senha obrigatória no primeiro acesso.")

except Exception:
    db.rollback()
    raise

finally:
    db.close()
