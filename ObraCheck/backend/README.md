# ObraCheck — Back-end

## 1. Sobre o projeto

O ObraCheck é um sistema web destinado ao gerenciamento de laudos de engenharia e vistorias de obras.

O sistema permite registrar e acompanhar não conformidades encontradas durante as vistorias, incluindo descrições e evidências, como fotografias, áudios, vídeos, documentos e localização.

## 2. Tecnologias utilizadas

- **Python:** linguagem de programação do back-end.
- **FastAPI:** desenvolvimento da API.
- **PostgreSQL:** banco de dados relacional.
- **SQLAlchemy:** comunicação entre Python e banco de dados.
- **Alembic:** gerenciamento de alterações no banco de dados.

## 3. Estrutura do projeto

```text
backend/
├── app/
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── services/
│   └── dependencies/
├── uploads/
├── tests/
├── .gitignore
└── README.md
```

### Responsabilidade das pastas

| Pasta | Responsabilidade |
|---|---|
| `app/` | Código principal do back-end. |
| `models/` | Representação das tabelas do banco de dados. |
| `schemas/` | Validação dos dados recebidos e enviados pela API. |
| `routers/` | Definição das rotas e endpoints. |
| `services/` | Regras de negócio do sistema. |
| `dependencies/` | Autenticação e controle de permissões. |
| `uploads/` | Armazenamento dos arquivos enviados pelos usuários. |
| `tests/` | Testes das funcionalidades do sistema. |

## 4. Perfis de acesso

O sistema possui três perfis:

- **Administrador:** gerenciamento de usuários.
- **Vistoriador:** acesso às obras vinculadas e registro de não conformidades.
- **Gestor:** acompanhamento das obras, análise de ocorrências e registro de observações.

## 5. Configuração do ambiente

O ambiente virtual Python deve ser criado localmente.

As configurações de conexão com o PostgreSQL serão armazenadas em um arquivo `.env`, que não deve ser compartilhado no GitHub.

## 6. Organização do desenvolvimento

O back-end será desenvolvido por etapas, começando pela configuração do ambiente e conexão com o banco de dados, seguindo para autenticação, usuários, obras, ocorrências, evidências e testes.

## 7. Observação

Este projeto está em desenvolvimento. A estrutura poderá ser ampliada conforme a implementação das funcionalidades do MVP.
