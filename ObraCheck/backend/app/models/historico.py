from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database import Base


class Historico(Base):
    __tablename__ = "historico"

    id = Column(Integer, primary_key=True, index=True)

    acao = Column(
        String(100),
        nullable=False
    )

    descricao = Column(
        Text,
        nullable=True
    )

    ocorrencia_id = Column(
        Integer,
        ForeignKey("ocorrencias.id", ondelete="RESTRICT"),
        nullable=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False
    )

    perfil = Column(
        String(30),
        nullable=False
    )

    criada_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )