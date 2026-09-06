# Como contribuir

Cada integrante deve usar sua própria conta GitHub e identidade Git. O histórico precisa refletir trabalho real, conforme a rubrica. Não atribua commits fictícios ou retroativos a colegas.

1. Solicite acesso à titular do repositório.
2. Clone o projeto e execute o setup do README.
3. Crie uma branch curta e descritiva para a tarefa.
4. Implemente uma mudança útil: melhoria de interface, teste, documentação validada ou ajuste de regra acordado pela equipe.
5. Execute `npm run check`, `npm run format:check` e, se afetar comportamento, `npm run test:e2e`.
6. Abra um pull request descrevendo o problema, resultado e verificação.
7. Peça revisão de outro integrante e integre após os checks.

Não versionar `.env.local`, banco SQLite, senhas, tokens ou dados de pessoas reais. Não alterar a relação de integrantes sem confirmação da equipe. Para formatar: `npm run format`.
