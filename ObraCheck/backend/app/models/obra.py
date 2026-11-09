from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Obra(Base):
    __tablename__ = "obras"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(150), nullable=False)

    endereco = Column(String(255), nullable=False)

    descricao = Column(Text, nullable=True)

    data_inicio = Column(Date, nullable=True)

    previsao_termino = Column(Date, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="em_andamento"
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    atualizado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )