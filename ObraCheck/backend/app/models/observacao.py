from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Observacao(Base):
    __tablename__ = "observacoes"

    id = Column(Integer, primary_key=True, index=True)

    texto = Column(Text, nullable=False)

    ocorrencia_id = Column(
        Integer,
        ForeignKey("ocorrencias.id"),
        nullable=False
    )

    gestor_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    criada_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )