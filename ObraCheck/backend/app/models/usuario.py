from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(150), nullable=False)

    cpf = Column(String(11), unique=True, nullable=False, index=True)

    senha_hash = Column(String(255), nullable=False)

    perfil_id = Column(Integer, ForeignKey("perfis.id"), nullable=False)

    ativo = Column(Boolean, default=True, nullable=False)

    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    atualizado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    precisa_trocar_senha = Column(
    Boolean,
    default=True,
    nullable=False
    )