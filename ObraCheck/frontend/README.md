# ObraCheck — Front-end MVP

## Requisitos
- Node.js 20 ou superior
- VS Code

## Como executar
1. Extraia a pasta do ZIP.
2. Abra a pasta `obracheck-frontend` no VS Code.
3. Abra o terminal integrado.
4. Execute:

```bash
npm install
npm run dev
```

5. Abra o endereço local mostrado no terminal (normalmente http://localhost:5173).

## Contas de demonstração
| Perfil | CPF | Senha |
|---|---|---|
| Administrador | 999.999.999-99 | 123456 |
| Vistoriador | 111.111.111-11 | 123456 |
| Gestor | 222.222.222-22 | 123456 |

## O que está implementado
- Login único por CPF e senha.
- Área do Vistoriador: seleção de obra, painel, criação/revisão de não-conformidade, confirmação e detalhes.
- Área do Gestor: indicadores, acompanhamento das obras e ocorrências, atualização de status.
- Área do Administrador: cadastro, edição, ativação e desativação de usuários.
- Logout com confirmação.
- Layout responsivo para desktop e celular.
- Persistência demonstrativa com `localStorage`.

## Importante
Este pacote contém somente o front-end. A autenticação e os dados são simulados no navegador com `localStorage`; não existe API, banco de dados, envio real de arquivos nem controle de segurança de produção. Para uso real, conecte o front-end ao backend e implemente autenticação/autorização no servidor.
