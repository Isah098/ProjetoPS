
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.usuario import UsuarioCriar, UsuarioResposta
from app.services.usuario_service import cadastrar_usuario
from app.dependencies.auth import exigir_perfil


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_usuario(
    dados: UsuarioCriar,
    db: Session = Depends(get_db),
    administrador=Depends(exigir_perfil("administrador"))
):
    try:
        from app.models.perfil import Perfil

        perfil = db.query(Perfil).filter(
            Perfil.id == dados.perfil_id
        ).first()

        if not perfil or perfil.nome not in ("gestor", "vistoriador"):
            raise HTTPException(
                status_code=400,
                detail="Só é permitido cadastrar gestores e vistoriadores."
            )

        usuario, senha_inicial = cadastrar_usuario(
            db=db,
            nome=dados.nome,
            cpf=dados.cpf,
            perfil_id=dados.perfil_id
        )

        db.commit()
        db.refresh(usuario)

        return {
            "mensagem": "Usuário cadastrado com sucesso!",
            "usuario": UsuarioResposta.model_validate(usuario),
            "senha_inicial": senha_inicial
        }

    
    except HTTPException:
        db.rollback()
        raise

    except ValueError as erro:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao cadastrar usuário."
        )



from pydantic import BaseModel, Field
from app.models.usuario import Usuario
from app.models.perfil import Perfil

class UsuarioEditar(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    cpf: str = Field(min_length=11, max_length=11)
    perfil_id: int

class UsuarioAtivar(BaseModel):
    ativo: bool

@router.get("/", response_model=list[UsuarioResposta])
def listar_usuarios(db: Session = Depends(get_db), admin=Depends(exigir_perfil("administrador"))):
    return db.query(Usuario).order_by(Usuario.id).all()

@router.put("/{usuario_id}", response_model=UsuarioResposta)
def editar_usuario(usuario_id: int, dados: UsuarioEditar, db: Session = Depends(get_db), admin=Depends(exigir_perfil("administrador"))):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(404, "Usuário não encontrado.")
    perfil = db.get(Perfil, dados.perfil_id)
    if not perfil or perfil.nome not in ("gestor", "vistoriador"):
        raise HTTPException(400, "Perfil inválido.")
    if usuario.id == admin.id:
        raise HTTPException(403, "Não é permitido alterar a própria conta administrativa.")
    cpf = ''.join(c for c in dados.cpf if c.isdigit())
    if len(cpf) != 11:
        raise HTTPException(400, "CPF inválido.")
    duplicado = db.query(Usuario).filter(Usuario.cpf == cpf, Usuario.id != usuario_id).first()
    if duplicado:
        raise HTTPException(409, "CPF já cadastrado.")
    usuario.nome, usuario.cpf, usuario.perfil_id = dados.nome, cpf, dados.perfil_id
    db.commit()
    db.refresh(usuario)
    return usuario

@router.patch("/{usuario_id}/ativo", response_model=UsuarioResposta)
def alterar_ativo(usuario_id: int, dados: UsuarioAtivar, db: Session = Depends(get_db), admin=Depends(exigir_perfil("administrador"))):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(404, "Usuário não encontrado.")
    if usuario.id == admin.id:
        raise HTTPException(403, "Não é permitido desativar a própria conta.")
    usuario.ativo = dados.ativo
    db.commit()
    db.refresh(usuario)
    return usuario

@router.get('/perfis/disponiveis')
def perfis_disponiveis(db: Session = Depends(get_db), admin=Depends(exigir_perfil('administrador'))):
    return [{'id': p.id, 'nome': p.nome} for p in db.query(Perfil).all()]
