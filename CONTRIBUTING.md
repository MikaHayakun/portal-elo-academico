# Como contribuir

Cada integrante deve usar sua própria conta GitHub e identidade Git. O histórico precisa refletir trabalho real, conforme a rubrica. Não atribua commits fictícios ou retroativos a colegas.

1. Informe sua conta à titular do repositório e aceite o convite de colaboração usando essa conta.
2. Clone o projeto e execute o setup do README.
3. Crie uma branch curta e descritiva para a tarefa.
4. Implemente uma mudança útil: melhoria de interface, teste, documentação validada ou ajuste de regra acordado pela equipe.
5. Execute `npm run check`, `npm run format:check` e, se afetar comportamento, `npm run test:e2e`.
6. Abra um pull request descrevendo o problema, resultado e verificação.
7. Peça revisão de outro integrante e integre após os checks.

Para a entrega, registre o link do commit ou pull request e uma descrição do trabalho realizado. Use um e-mail associado à sua conta GitHub na autoria dos commits. A lista de nomes no README e o aceite do convite comprovam identificação e acesso; cada integrante também precisa de um histórico de colaborações próprias.

Não versionar `.env.local`, banco SQLite, senhas, tokens ou dados de pessoas reais. Não alterar a relação de integrantes sem confirmação da equipe. Para formatar: `npm run format`.
