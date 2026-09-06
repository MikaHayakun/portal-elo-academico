# Requisitos

## Fundamentação e Base Documental
O planejamento e a especificação de requisitos desta Prova de Conceito (PoC) foram estruturados com base nos materiais de orientação da disciplina de **Desenvolvimento de Sistemas Orientados a Dispositivos Móveis e Baseados na Web**. 

O alinhamento teórico e a rastreabilidade do projeto sustentam-se em três pilares:

1. **Estratégia de Experiência do Usuário (UX):** A modelagem de personas e o mapeamento das jornadas de uso seguiram as metodologias de design centrado no usuário abordadas nas webconferências de orientação da disciplina. Esses conceitos foram aplicados para justificar a interface intuitiva desenhada para a nossa persona principal.

2. **Rastreabilidade de Escopo:** O relatório consolidado da *1ª Entrega* do grupo serviu como base obrigatória. Isso garante que a PoC desenvolvida em Next.js seja a resposta direta ao problema de descentralização e fragmentação de dados identificado na etapa inicial do nosso projeto.

3. **Critérios de Validação Técnica:** Os requisitos de banco de dados local (SQLite) e a documentação do fluxo de uso foram estruturados de acordo com a solicitação oficial de avaliação de sistemas da segunda etapa do projeto integrador.

## Problema, público e solução

Cenário acadêmico fictício: cadastros de discentes, docentes, administrativos e prestadores distribuídos em planilhas e sistemas isolados dificultam a consulta e atualização pelo RH e pela secretaria. O Portal Elo Acadêmico centraliza esses registros em uma aplicação Web responsiva, utilizada durante o atendimento administrativo em computador ou dispositivo móvel.

Stakeholders: equipe operacional de RH/secretaria (agilidade), administração (organização e situação dos cadastros), instituição (qualidade das informações) e equipe de desenvolvimento/suporte (funcionamento e manutenção). As personas da ideação original permanecem: Maria, secretaria com menor familiaridade tecnológica, e Gustavo, analista de RH com familiaridade média. São perfis hipotéticos; não foram realizadas entrevistas nesta implementação.

## Revisão justificada

| Ideação inicial                                        | Ajuste implementado                                     | Justificativa                                             |
| ------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------- |
| P1 da secretaria atualiza prestador                    | A PoC atende Gustavo/P2, do RH                          | Alinha atribuição e tarefa sem alterar o problema central |
| Acessos recentes para falta de histórico de alterações | Histórico real com autor e antes/depois                 | Resolve diretamente a dor de rastreabilidade              |
| PF/PJ e terceirizado aparecem como um mesmo filtro     | Tipo de pessoa e vínculo são campos distintos           | Evita confusão entre natureza e vínculo institucional     |
| Atualização e sessão implícitas no texto               | Cadastro, edição, login e confirmação explicitados      | Torna o escopo verificável                                |
| Busca avançada e segurança genéricas                   | Filtros definidos, validação, sessão e regras de acesso | Limita a promessa ao comportamento demonstrável           |

## Rotina de Gustavo no portal

1. Gustavo entra com sua conta de RH.
2. Seleciona vínculo Prestador, tipo PF e busca documento ou nome.
3. Abre a ficha e confere o registro.
4. Atualiza o telefone; revisa os dados antes de confirmar.
5. Confirma a gravação e recebe feedback de sucesso.
6. Consulta novamente e verifica os dados persistidos e o histórico.
7. Encerra a sessão.

## Requisitos funcionais e aceitação

| ID   | Requisito           | Critério de aceitação                                                                   | Evidência                       |
| ---- | ------------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| RF01 | Autenticar equipe   | Credencial correta abre portal; inválida informa erro; API sem sessão retorna 401       | Testes E2E de acesso            |
| RF02 | Cadastrar PF/PJ     | Campos válidos geram registro persistido e evento de criação                            | E2E cadastro PJ; teste do banco |
| RF03 | Pesquisar cadastros | Busca por nome/nome social/documento e filtros combinados retornam resultados coerentes | E2E fluxo de trabalho do RH     |
| RF04 | Consultar e editar  | Ficha permite revisão e confirmação; versão atualizada é recuperável                    | E2E edição e recarga            |
| RF05 | Tratar alternativas | Entrada inválida, duplicidade e busca vazia produzem mensagens; cancelar não grava      | E2E validação e cancelamento    |
| RF06 | Auditar alterações  | Autor, data e valores antes/depois são registrados na mesma transação                   | Teste do banco e E2E histórico  |
| RF07 | Controlar situação  | Administração pode inativar; RH recebe 403 ao tentar contornar a interface              | E2E permissões                  |
| RF08 | Apresentar resumo   | Totais refletem pessoas, ativos, PF, PJ e vínculos do banco                             | API de estatísticas e painel    |
| RF09 | Encerrar acesso     | Logout invalida sessão no banco e remove cookie                                         | E2E logout                      |

## Regras de negócio

- RN01: documento único na base, sem duplicação por máscara.
- RN02: CPF com 11 dígitos ou CNPJ numérico com 14, com verificadores válidos.
- RN03: PJ somente como prestador, sem nome social.
- RN04: cada cadastro possui exatamente um vínculo principal nesta versão.
- RN05: RH cria cadastros ativos e edita dados; alteração de situação é da administração.
- RN06: registro não é excluído; pode ser inativado para preservar histórico.
- RN07: atualização depende da versão lida; conflito retorna 409 e solicita reabrir a ficha.
- RN08: salvar sem modificar valores não cria evento de atualização redundante.
- RN09: cinco tentativas inválidas por e-mail em janela de 15 minutos bloqueiam novas tentativas até expirar.
- RN10: sessão expira em oito horas e é invalidada no logout.

## Requisitos não funcionais verificáveis

- RNF01: persistência SQLite em arquivo, com transação para cadastro e auditoria, unicidade e chaves estrangeiras.
- RNF02: rotas de dados exigem sessão; gravações verificam origem; situação exige papel adequado no servidor.
- RNF03: senha com salt e scrypt; cookie HttpOnly/SameSite, Secure em origem HTTPS; respostas da API sem cache compartilhado.
- RNF04: fluxo utilizável em 390 px e desktop; formulários com rótulos, foco visível, modal nativo e feedback explícito.
- RNF05: preparação e execução reproduzíveis pelo README, lockfile e versão Node definida.
- RNF06: código tipado, validação compartilhada, formatação e verificações automatizadas em CI.

## Fluxos alternativos

| Situação                        | Comportamento                                        |
| ------------------------------- | ---------------------------------------------------- |
| Sem resultado                   | Estado vazio com limpar filtros e criar cadastro     |
| Documento inválido              | Campo destacado; revisão bloqueada                   |
| Documento repetido              | Servidor retorna 409; formulário permanece aberto    |
| Cancelamento                    | Confirmação de descarte; nenhuma alteração enviada   |
| Versão antiga                   | Servidor retorna 409; instrução para reabrir ficha   |
| Falha de conexão/gravação       | Mensagem de erro; nenhum sucesso artificial          |
| Sessão ausente/expirada         | API retorna 401; página protegida direciona ao login |
| Mudança de status sem permissão | Servidor retorna 403, mesmo com requisição manual    |

Fora de escopo: sistema acadêmico completo, matrículas, notas, folha de pagamento, integrações, aplicativo nativo, importação, CNPJ alfanumérico, exclusão definitiva e administração de contas pela UI.
