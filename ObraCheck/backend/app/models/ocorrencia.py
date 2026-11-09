from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func


from app.database import Base


class Ocorrencia(Base):
    __tablename__ = "ocorrencias"

    id = Column(Integer, primary_key=True, index=True)

    protocolo = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True
    )

    descricao = Column(Text, nullable=False)

    status = Column(
        String(30),
        nullable=False,
        default="pendente"
    )

    obra_id = Column(
        Integer,
        ForeignKey("obras.id"),
        nullable=False
    )

    vistoriador_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    criada_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    atualizada_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )