# Revisão das dependências

Revisão em 06/09/2026, com Node.js 24.15.0 e npm 11.12.1.

## Resultado

O `package-lock.json` passou de **6.843 para 6.811 linhas** e de **438 para 436 entradas de pacotes**, sem contar a entrada do próprio projeto. O tamanho passou de 234.059 para 232.815 bytes. As 15 dependências diretas foram mantidas, pois todas têm uso identificado.

O arquivo registra a árvore de dependências e os dados necessários para reproduzir a instalação. Não é código executado pelo navegador. A redução elimina duplicações na instalação das ferramentas; não foi medido ganho de velocidade no portal. Consulte a [documentação do package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/).

## O que foi examinado

Todos os 438 registros originais foram analisados como uma árvore pelo Arborist, o resolvedor utilizado pelo npm. Foram conferidos os vínculos entre pacotes, as dependências obrigatórias e de pares, as versões repetidas, os metadados de descontinuação e as restrições de plataforma. A árvore não tinha pacotes órfãos nem dependências obrigatórias com erro de resolução.

Foram identificados 379 registros exclusivos de desenvolvimento antes da limpeza e 377 depois. Os 82 registros com restrições de sistema operacional ou arquitetura foram preservados integralmente. Esses pacotes dão suporte a diferentes ambientes e não devem ser removidos apenas por não serem usados na máquina atual.

A revisão cobre os registros do lockfile e o uso das dependências pelo projeto; não constitui auditoria do código-fonte interno de todas as bibliotecas.

## Uso das dependências diretas

| Dependência            | Função verificada no projeto                                  |
| ---------------------- | ------------------------------------------------------------- |
| `next`                 | Páginas, servidor, rotas HTTP, navegação e compilação         |
| `react`                | Componentes, estado e interações da interface                 |
| `react-dom`            | Renderização e integração do React com o Next.js              |
| `lucide-react`         | Ícones importados pelos três componentes da interface         |
| `zod`                  | Validação dos cadastros, autenticação e requisições           |
| `@types/node`          | Tipagem das APIs Node, incluindo arquivos, processos e SQLite |
| `@types/react`         | Tipagem de componentes, hooks e JSX                           |
| `@types/react-dom`     | Tipagem da integração React DOM                               |
| `typescript`           | Verificação de tipos e suporte ao projeto TypeScript          |
| `tsx`                  | Execução dos scripts de preparação, demonstração e testes     |
| `eslint`               | Análise estática executada por `npm run lint`                 |
| `eslint-config-next`   | Regras de Next.js, React e TypeScript                         |
| `prettier`             | Formatação e verificação de estilo no CI                      |
| `@playwright/test`     | Testes no navegador e captura da demonstração                 |
| `@axe-core/playwright` | Verificações automatizadas de acessibilidade                  |

## Limpeza aplicada

Foi utilizado `npm dedupe`, primeiro em simulação e depois em uma cópia isolada. O npm removeu as cópias aninhadas de `@eslint-community/eslint-utils` e `eslint-visitor-keys` sob `@next/eslint-plugin-next`. Os solicitantes passaram a compartilhar as cópias compatíveis existentes na árvore.

A cópia compartilhada de `@eslint-community/eslint-utils` passou de 4.10.1 para 4.9.1, versão exigida exatamente por `@next/eslint-plugin-next@16.3.4` e aceita pelos demais solicitantes.

As outras versões repetidas foram mantidas: não se deve forçar uma única versão quando os solicitantes exigem faixas diferentes.

## Pendência de manutenção

O ESLint 9.39.5 está fora de suporte desde 06/08/2026, conforme a [política oficial de versões](https://eslint.org/version-support/). Os plugins instalados `eslint-plugin-react@7.37.5`, `eslint-plugin-jsx-a11y@6.10.2` e `eslint-plugin-import@2.32.0` ainda declaram faixas de compatibilidade que não incluem ESLint 10.

## Validação

Foram aprovados:

- Instalação limpa e resolução da árvore sem erros obrigatórios.
- ESLint, TypeScript e compilação de produção.
- Quatro testes de domínio e seis cenários de navegador, com banco temporário.
- Auditoria npm sem vulnerabilidades conhecidas reportadas, antes e após a limpeza.
