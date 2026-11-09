from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    UniqueConstraint
)
from sqlalchemy.sql import func

from app.database import Base


class UsuarioObra(Base):
    __tablename__ = "usuario_obras"

    __table_args__ = (
        UniqueConstraint(
            "usuario_id",
            "obra_id",
            name="uq_usuario_obra"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    obra_id = Column(
        Integer,
        ForeignKey("obras.id"),
        nullable=False
    )

    vinculado_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )