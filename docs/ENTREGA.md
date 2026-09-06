# Entrega e roteiro de apresentação

## Rubrica da segunda etapa

Base: quarta webconferência, pp. 19–23, e quinta, pp. 18–22.

| Critério                        | Peso | Artefato                                                                                    |
| ------------------------------- | ---: | ------------------------------------------------------------------------------------------- |
| Revisitar projeto e definir PoC |  1,0 | `REQUISITOS.md`: revisão justificada e jornada do RH                                        |
| Preparar ambiente               |  2,0 | README, package-lock, .nvmrc, setup e instruções                                            |
| Frontend                        |  2,0 | Interface Next.js/React responsiva com consulta e formulário                                |
| Backend e dados                 |  2,0 | Rotas HTTP, SQLite persistente, regras e auditoria                                          |
| Vídeo de até 1 minuto           |  1,0 | `demo-projeto.mp4`: fluxo real com legendas                                                 |
| GitHub                          |  2,0 | Código, documentação, evidências e CI; participação dos integrantes a completar pela equipe |

A tabela identifica evidências, não antecipa nota do professor.

## Checklist da equipe

- [x] Revisão da ideação e escopo documentados.
- [x] Implementação frontend/backend e persistência preparada.
- [x] Instruções de execução e contas locais documentadas.
- [ ] Confirmar identificação da equipe no material restrito e vincular os cinco integrantes no GitHub.
- [ ] Cada integrante realizar e registrar sua contribuição real.
- [ ] Conferir prazo e formato de postagem no AVA.
- [ ] Integrante responsável postar a entrega pelo Blackboard.

Os slides de Adriano informam 08/09 às 23h55. Confirmar na agenda da turma; o material de Gustavo traz outro prazo. Publicar no GitHub não efetua a postagem acadêmica no Blackboard.

## Roteiro de vídeo

Demonstração sem narração, com legendas em português, mostrando a aplicação real. Não há necessidade de edição profissional segundo os materiais.

- 0–7 s: problema e visão do portal.
- 7–16 s: Gustavo/RH filtra prestadores PF e localiza Clara.
- 16–28 s: abre a ficha e altera o telefone.
- 28–37 s: revisa e confirma a gravação.
- 37–48 s: consulta novamente e mostra histórico com autor e alteração.
- 48–55 s: tecnologias e benefício entregue.

O script `npm run demo` captura a demonstração a partir de uma instância de teste na porta 3100. As credenciais usadas são exclusivas desse banco temporário. Para repetir: construir o projeto, iniciar `npx tsx scripts/test-server.ts` em um terminal e executar `npm run demo` em outro. A conversão para MP4 requer FFmpeg, conforme instruções no script. Não grava senhas nem cadastros reais.

## Privacidade da publicação

Por orientação da titular, PDFs de origem, lista nominal extraída dos materiais, arquivos de banco e credenciais não integram o repositório público. A identificação acadêmica deve ser fornecida ao professor por canal restrito. O check `npm run check:public` bloqueia o versionamento dos principais formatos de material e banco. A documentação pública descreve a implementação e seus requisitos, sem anexar os documentos de origem.
