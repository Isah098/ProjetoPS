from sqlalchemy import Column, Integer, String

from app.database import Base


class Perfil(Base):
    __tablename__ = "perfis"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(
        String(30),
        unique=True,
        nullable=False
    )