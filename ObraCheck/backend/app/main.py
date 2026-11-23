import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import autenticacao, usuarios, obras, usuario_obras, ocorrencias, evidencias, historico

app = FastAPI(
    title="ObraCheck API",
    description="API para gerenciamento de vistorias e não-conformidades em obras",
    version="1.0.0"
)

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Registrar rotas
app.include_router(autenticacao.router)
app.include_router(usuarios.router)
app.include_router(obras.router)
app.include_router(usuario_obras.router)
app.include_router(ocorrencias.router)
app.include_router(evidencias.router)
app.include_router(historico.router)

@app.get("/")
def inicio():
    return {
        "mensagem": "Bem-vindo à API do ObraCheck!",
        "status": "funcionando"
    }


@app.get("/health")
def verificar_saude():
    return {
        "status": "online"
    }

