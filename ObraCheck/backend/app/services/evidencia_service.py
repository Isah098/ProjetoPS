
import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.evidencia import Evidencia
from app.models.ocorrencia import Ocorrencia


PASTA_UPLOADS = Path("uploads")

TAMANHO_MAXIMO = 10 * 1024 * 1024  # 10 MB


TIPOS_PERMITIDOS = {
    ".jpg": "imagem/jpeg",
    ".jpeg": "imagem/jpeg",
    ".png": "imagem/png",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}



async def cadastrar_evidencia(
    db: Session,
    arquivo: UploadFile,
    ocorrencia_id: int
):
    ocorrencia = db.query(Ocorrencia).filter(
        Ocorrencia.id == ocorrencia_id
    ).first()

    if not ocorrencia:
        raise ValueError("Ocorrência não encontrada.")

    extensao = Path(arquivo.filename or "").suffix.lower()

    if extensao not in TIPOS_PERMITIDOS:
        raise ValueError("Tipo de arquivo não permitido.")

    conteudo = await arquivo.read(TAMANHO_MAXIMO + 1)

    if not conteudo:
        raise ValueError("O arquivo está vazio.")

    if len(conteudo) > TAMANHO_MAXIMO:
        raise ValueError("O arquivo ultrapassa o limite de 10 MB.")

    PASTA_UPLOADS.mkdir(parents=True, exist_ok=True)

    nome_arquivo = f"{uuid.uuid4().hex}{extensao}"
    caminho = PASTA_UPLOADS / nome_arquivo

    try:
        with caminho.open("xb") as destino:
            destino.write(conteudo)

        nova_evidencia = Evidencia(
            nome_arquivo=arquivo.filename,
            caminho_arquivo=str(caminho),
            tipo_arquivo=TIPOS_PERMITIDOS[extensao],
            tamanho_bytes=len(conteudo),
            ocorrencia_id=ocorrencia_id
        )

        db.add(nova_evidencia)
        db.flush()

        return nova_evidencia

    except Exception:
        db.rollback()

        if caminho.exists():
            caminho.unlink()

        raise

    finally:
        await arquivo.close()
