# ObraCheck — Documentação do Front-end

## 1. Visão geral

O front-end do ObraCheck foi desenvolvido utilizando React, JavaScript, CSS e Vite. O sistema possui uma interface responsiva e está organizado de acordo com os três perfis de acesso: Administrador, Gestor e Vistoriador.

O objetivo é permitir que cada perfil acesse suas funcionalidades específicas para gerenciamento de usuários, acompanhamento de obras e registro de não-conformidades.

## 2. Funcionalidades desenvolvidas

### 2.1. Autenticação
- Tela de login utilizando CPF e senha.
- Identificação do perfil do usuário após o acesso.
- Direcionamento para a área correspondente ao perfil.
- Opção de sair da conta com confirmação.

### 2.2. Administrador
- Visualização dos usuários cadastrados.
- Cadastro de novos usuários.
- Edição de informações dos usuários.
- Ativação e desativação de contas.
- Definição do perfil de acesso: Gestor ou Vistoriador.

### 2.3. Vistoriador
- Visualização das obras vinculadas ao usuário.
- Seleção da obra em que deseja realizar a vistoria.
- Painel individual de cada obra.
- Visualização das não-conformidades registradas.
- Cadastro de novas não-conformidades.
- Preenchimento do título, local, descrição e gravidade da ocorrência.
- Seleção de fotos para anexar ao registro.
- Etapa de revisão antes da confirmação.
- Visualização dos detalhes da ocorrência.

### 2.4. Gestor
- Painel geral para acompanhamento das obras.
- Visualização de indicadores e progresso das obras.
- Acesso individual às informações de cada obra.
- Consulta das não-conformidades registradas.
- Visualização dos detalhes das ocorrências.
- Atualização do status das não-conformidades.
- Campo para registro de observações.

## 3. Estrutura e tecnologias

- **React:** construção das interfaces e componentes.
- **JavaScript:** implementação das funcionalidades e interações.
- **CSS:** estilização e responsividade.
- **Vite:** ambiente de desenvolvimento e execução do front-end.

## 4. Integração necessária com o back-end

Atualmente, o front-end utiliza dados simulados e armazenamento local (`localStorage`) para demonstrar as funcionalidades.

Para a integração com o back-end, será necessário implementar:

- Autenticação de usuários por CPF e senha.
- Identificação e validação dos perfis de acesso.
- Consulta e gerenciamento de usuários.
- Consulta das obras vinculadas a cada vistoriador.
- Consulta das informações e do progresso das obras.
- Cadastro e consulta de não-conformidades.
- Envio e armazenamento das fotos das ocorrências.
- Atualização do status das não-conformidades.
- Registro e consulta das observações realizadas pelo gestor.

## 5. Entidades e informações necessárias

Para facilitar a integração, as principais entidades envolvidas são:

- **Usuário:** identificação, nome, CPF, senha e perfil de acesso.
- **Obra:** identificação, nome, endereço e informações de acompanhamento.
- **Vínculo entre usuário e obra:** associação dos vistoriadores às obras.
- **Não-conformidade:** identificação, obra relacionada, título, descrição, local, gravidade, data e status.
- **Anexos:** fotos e arquivos associados às não-conformidades.
- **Observações:** registros realizados pelo gestor sobre as ocorrências.

## 6. Observações para integração

O front-end já possui as principais telas, fluxos de navegação e interações necessárias para os três perfis.

A próxima etapa é substituir os dados simulados pelas informações disponibilizadas pela API do back-end.

Será necessário alinhar os endpoints, os formatos das requisições e respostas, a autenticação e o tratamento dos erros entre as duas partes do projeto.

**Importante:** a autenticação, as permissões e a validação dos dados deverão ser implementadas e verificadas também no servidor. O controle visual de acesso no front-end não substitui a segurança do back-end.
