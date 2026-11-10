from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    BigInteger
)
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy import Float

class Evidencia(Base):
    __tablename__ = "evidencias"

    id = Column(Integer, primary_key=True, index=True)

    nome_arquivo = Column(
        String(255),
        nullable=False
    )

    caminho_arquivo = Column(
        String(500),
        nullable=False,
        unique=True
    )

    tipo_arquivo = Column(
        String(50),
        nullable=False
    )

    tamanho_bytes = Column(
        BigInteger,
        nullable=False
    )

    ocorrencia_id = Column(
        Integer,
        ForeignKey("ocorrencias.id"),
        nullable=False
    )

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    enviada_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )