# ObraCheck — Registro de Não Conformidades

## Sobre o projeto

O ObraCheck é um sistema desenvolvido na disciplina de Processos de Software, voltado ao registro, gerenciamento e acompanhamento de não conformidades identificadas durante vistorias em obras.

A proposta é centralizar as informações das ocorrências, facilitar a comunicação entre os profissionais envolvidos e proporcionar maior organização e rastreabilidade dos registros.

## Objetivo

Permitir que o vistoriador registre não conformidades com descrições e evidências, enquanto o gestor acompanha as ocorrências, seus respectivos status e históricos. O sistema também possibilita o gerenciamento de usuários, obras e permissões de acesso.

## Perfis de usuário

- **Administrador:** gerenciamento de usuários, perfis e permissões de acesso.
- **Gestor:** gerenciamento e acompanhamento das obras e das não conformidades registradas.
- **Vistoriador:** acesso às obras vinculadas, registro e consulta das não conformidades identificadas durante as vistorias.

## Evolução do projeto

### UN1 — Prototipação

Na UN1, foi elaborado um protótipo navegável utilizando o Figma Make, com telas e fluxos que representam as principais funcionalidades propostas para o sistema.

**Protótipo:** [Acessar protótipo no Figma](https://www.figma.com/make/8ZioTam1GHsoxkXAKynW4B/MVP-do-projeto?t=eoup4JPGo1utL0GL-1)

### UN2 — Desenvolvimento do MVP

Na UN2, o protótipo evoluiu para uma aplicação web funcional, com integração entre frontend, backend e banco de dados.

Foram implementadas as principais funcionalidades propostas, permitindo a utilização do sistema com autenticação, controle de acesso, armazenamento persistente de dados e gerenciamento das não conformidades.

## Funcionalidades implementadas

- Autenticação de usuários.
- Controle de acesso por perfil.
- Cadastro e gerenciamento de usuários.
- Cadastro e gerenciamento de obras.
- Vinculação de usuários às obras.
- Registro de não conformidades.
- Consulta e acompanhamento de ocorrências.
- Registro de evidências.
- Atualização do status das ocorrências.
- Histórico de alterações e auditoria.
- Persistência de dados no PostgreSQL.
- Integração entre frontend e backend.
- Inicialização automatizada da aplicação.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| HTML | Estrutura das interfaces |
| CSS | Estilização das interfaces |
| JavaScript | Interatividade e integração com a API |
| Python | Desenvolvimento do backend |
| FastAPI | Desenvolvimento da API REST |
| PostgreSQL | Banco de dados relacional |
| Swagger | Documentação e testes da API |
| Vite | Ambiente de desenvolvimento do frontend |
| Git | Controle de versionamento |
| GitHub | Hospedagem do código-fonte |
| GitHub Projects | Gerenciamento das atividades |
| Figma Make | Prototipação das interfaces |
| Visual Studio Code | Ambiente de desenvolvimento |

## Arquitetura do sistema

O sistema é organizado em três camadas principais:

- **Frontend:** responsável pelas interfaces e pela interação com os usuários.
- **Backend:** responsável pelas regras de negócio, autenticação, permissões e comunicação com o banco de dados.
- **Banco de dados:** responsável pelo armazenamento persistente das informações do sistema.

A comunicação entre o frontend e o backend é realizada por meio de uma API REST.

## Estrutura do projeto

- **frontend/** — Interfaces e interação com o usuário.
- **backend/** — API, regras de negócio e integração com o banco de dados.
- **iniciar.bat** — Script de inicialização automatizada da aplicação.
- **README.md** — Documentação geral do projeto.

## Como executar o projeto

### Pré-requisitos

Para executar o ObraCheck localmente, é necessário possuir:

- Python.
- Node.js.
- PostgreSQL.
- Dependências do frontend e do backend instaladas.
- Banco de dados e variáveis de ambiente devidamente configurados.

### Inicialização da aplicação

Para facilitar a execução do sistema, foi desenvolvido o arquivo `iniciar.bat`, que automatiza a inicialização do frontend e do backend.

1. Baixe ou clone o repositório do projeto.
2. Configure o ambiente e o banco de dados.
3. Abra a pasta principal do ObraCheck.
4. Clique com o botão direito do mouse na pasta do projeto.
5. Selecione a opção **"Revelar no Explorador de Arquivos"** para abrir a pasta no Windows.
6. Localize o arquivo `iniciar.bat` e dê um duplo clique para executá-lo.
7. Aguarde a inicialização dos serviços.
8. Acesse a aplicação pelo navegador.

**Observação:** Não é necessário iniciar manualmente o frontend e o backend em terminais separados, pois o arquivo `iniciar.bat` realiza esse processo automaticamente.
### Endereços de acesso

- **Aplicação web:** http://localhost:5173
- **Backend:** http://127.0.0.1:8000
- **Documentação da API (Swagger):** http://127.0.0.1:8000/docs

**Observação:** o script `iniciar.bat` foi desenvolvido para o sistema operacional Windows. Os serviços devem permanecer em execução durante a utilização da aplicação.

## Testes e validação

Durante o desenvolvimento do MVP, foram realizados testes funcionais para verificar o comportamento do sistema, incluindo:

- Autenticação de usuários.
- Controle de acesso e permissões.
- Cadastro e gerenciamento de informações.
- Registro e acompanhamento de ocorrências.
- Persistência dos dados.
- Funcionamento dos endpoints da API.
- Integração entre frontend e backend.

Os testes contribuíram para a identificação e correção de erros, bem como para a validação dos principais fluxos da aplicação.

## Metodologia e organização do projeto

O desenvolvimento foi organizado utilizando um quadro Kanban no GitHub Projects, permitindo o planejamento, a distribuição e o acompanhamento das atividades realizadas pela equipe.

O Git e o GitHub foram utilizados para o controle de versionamento, registro das alterações e desenvolvimento colaborativo.

**Quadro de gerenciamento:** [Acessar Kanban do projeto](https://github.com/users/Isah098/projects/3)

## Trabalhos futuros

- Disponibilização da aplicação em um ambiente de hospedagem online.
- Ampliação dos testes automatizados.
- Aprimoramento da segurança do sistema.
- Melhorias na interface e na experiência do usuário.
- Evolução da aplicação para dispositivos móveis.

## Equipe

- Janaína Amorim Mota
- Maria Isabela Oliveira Nogueira

## Status do projeto

MVP web funcional, com frontend, backend e banco de dados integrados, desenvolvido para fins acadêmicos na disciplina de Processos de Software.
