
from sqlalchemy.orm import Session

from app.models.obra import Obra


def cadastrar_obra(
    db: Session,
    nome: str,
    endereco: str,
    descricao: str | None,
    data_inicio,
    previsao_termino,
    status: str
):
    nova_obra = Obra(
        nome=nome,
        endereco=endereco,
        descricao=descricao,
        data_inicio=data_inicio,
        previsao_termino=previsao_termino,
        status=status
    )

    db.add(nova_obra)
    db.flush()

    return nova_obra
