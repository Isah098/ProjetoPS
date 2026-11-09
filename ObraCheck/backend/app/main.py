
from fastapi import FastAPI

from app.routers import autenticacao, usuarios, obras, usuario_obras, ocorrencias, evidencias, historico

app = FastAPI(
    title="ObraCheck API",
    description="API para gerenciamento de vistorias e não-conformidades em obras",
    version="1.0.0"
)

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
