# Portal Elo Acadêmico

Aplicação Web para centralizar cadastros de pessoas físicas e jurídicas de uma instituição acadêmica. Secretaria e RH podem pesquisar, cadastrar e atualizar pessoas, com revisão antes de salvar e histórico de alterações.

**Projeto Integrador TADS — Desenvolvimento de Sistemas Orientados a Dispositivos Móveis e Baseados na Web.** Prova de conceito com dados fictícios, autenticação, frontend React e backend Next.js com SQLite.

![Gestão de pessoas](docs/images/pessoas.png)

## Equipe

- Adrian Juan De Oliveira Silva
- Everton de Oliveira Amaral
- Ludmylla Fernanda Costa Oliveira
- Mikah Liz Oliveira Silva
- Uri Dicaio Silva

## Revisita ao Projeto e Justificativa da PoC

Com base na modelagem estratégica da primeira etapa, revisitamos as jornadas de uso e definimos que a nossa **Prova de Conceito (PoC)** focará na rotina de **consulta e atualização de cadastros de prestadores terceirizados** pelo usuário do RH (Gustavo).

A escolha deste fluxo se justifica por ser o processo administrativo de maior volume e criticidade na instituição, permitindo-nos validar de ponta a ponta a busca por CPF/CNPJ, a usabilidade da interface de revisão e a segurança da persistência de dados.

## Executar localmente

Requisitos: **Node.js 24.15 ou superior na série 24**, npm e Git. O SQLite é fornecido pelo Node; não é necessário instalar um servidor de banco, PHP ou MySQL.

```bash
git clone https://github.com/MikaHayakun/portal-elo-academico.git
cd portal-elo-academico
npm ci
npm run setup
npm run dev
```

`npm ci` instala as dependências nas versões registradas no projeto. `npm run setup` cria as tabelas e carrega os dados fictícios; não é necessário executar scripts SQL manualmente. `npm run dev` inicia o servidor Next.js, que atende tanto às páginas quanto às rotas do backend. Mantenha o terminal aberto durante o uso e pressione `Ctrl+C` para encerrar.

Acesse **http://localhost:3000**. O setup cria o banco `data/elo.sqlite`, cinco cadastros fictícios e duas contas. As senhas aleatórias ficam no arquivo local `.env.local`:

| Conta               | Senha no `.env.local`   | Permissões                                                              |
| ------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `admin@elo.local`   | `ELO_ADMIN_PASSWORD`    | Consultar, cadastrar, editar, ativar/inativar e consultar histórico     |
| `gustavo@elo.local` | `ELO_OPERATOR_PASSWORD` | Consultar, cadastrar pessoas ativas, editar dados e consultar histórico |

Abra `.env.local` no editor para consultar as senhas.

Para testar a versão otimizada (produção):

```bash
npm run build
npm start
```

## O que funciona

- Login com senha armazenada como hash scrypt e sessão com expiração de oito horas.
- Cadastro PF/PJ, vínculo institucional, situação, contato e observações.
- Validação de CPF e CNPJ **numérico**, unicidade de documento e campos obrigatórios.
- Busca por nome, nome social ou documento, filtros combinados e paginação.
- Edição com revisão/confirmação e cancelamento sem persistência.
- Histórico com responsável, horário e valores anteriores/novos.
- Proteção contra edição concorrente por versão do registro.
- Indicadores calculados a partir do banco, visão geral e guia de uso.
- Layout responsivo, controles por teclado e mensagens de erro/sucesso.

A demonstração acompanha **a rotina de Gustavo, do RH, ao consultar e atualizar o cadastro de um prestador**. Os dados iniciais são fictícios e servem apenas para demonstração.

## Tecnologias e organização

Next.js App Router, React, TypeScript, HTML semântico e CSS próprio; Zod para validação compartilhada, Lucide para ícones, SQLite nativo para persistência, Playwright para testes de navegador, axe-core para verificações automatizadas de acessibilidade, ESLint e Prettier para qualidade do código. As versões exatas estão no `package-lock.json`

```text
src/app/             páginas, estilos e rotas HTTP
src/components/      portal, login e formulário reutilizável
src/lib/             regras, banco, autenticação e respostas HTTP
scripts/             preparação, testes e captura de demonstração
tests/               testes de domínio e navegador
docs/                requisitos, arquitetura, entrega e evidências
data/                banco local (não versionado)
```

## Documentação Complementar

- [Requisitos](./docs/REQUISITOS.md)
- [Arquitetura e Modelo de Dados](./docs/ARQUITETURA.md)
- [Entrega e Testes](./docs/ENTREGA.md)
- [Dependências](./docs/DEPENDENCIAS.md)
- [Vídeo de Apresentação](./docs/demo-projeto.mp4)
