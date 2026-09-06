"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  History,
  CircleHelp,
  LogOut,
  Search,
  Plus,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Building2,
  UserRound,
  CircleCheck,
  SlidersHorizontal,
  X,
  Menu,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Network,
} from "lucide-react";
import {
  categories,
  formatDocument,
  type Person,
  type User,
  type Audit,
} from "@/lib/domain";
import PersonDialog, { HistoryList } from "./person-dialog";

type Stats = {
  total: number;
  active: number;
  individuals: number;
  companies: number;
  categories: { category: string; count: number }[];
};
type PeopleResult = {
  items: Person[];
  total: number;
  page: number;
  pages: number;
};
const nav = [
  { id: "people", title: "Pessoas", icon: Users },
  { id: "overview", title: "Visão geral", icon: LayoutDashboard },
  { id: "history", title: "Histórico", icon: History },
  { id: "help", title: "Guia do portal", icon: CircleHelp },
] as const;
type Tab = (typeof nav)[number]["id"];
async function api<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Não foi possível carregar os dados.");
  return data;
}
export default function Portal({ user }: { user: User }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("people");
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [people, setPeople] = useState<PeopleResult>({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [dialog, setDialog] = useState<{ person: Person | null } | null>(null);
  const reload = useCallback(() => setRefresh((v) => v + 1), []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      setLoading(true);
      setError("");
    });
    const params = new URLSearchParams({
      q: search,
      category,
      type,
      status,
      page: String(page),
    });
    Promise.all([
      api<PeopleResult>(`/api/people?${params}`, controller.signal),
      api<Stats>("/api/stats", controller.signal),
      api<Audit[]>("/api/history", controller.signal),
    ])
      .then(([p, s, h]) => {
        setPeople(p);
        setStats(s);
        setHistory(h);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(e.message || "Falha de conexão. Tente novamente.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, category, type, status, page, refresh]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  function changeTab(value: Tab) {
    setTab(value);
    setMobile(false);
  }
  function clearFilters() {
    setQuery("");
    setSearch("");
    setCategory("");
    setType("");
    setStatus("");
    setPage(1);
  }
  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (response.ok || response.status === 401) {
        router.replace("/login");
        router.refresh();
      } else setError("Não foi possível encerrar a sessão. Tente novamente.");
    } catch {
      setError("Falha ao sair. Verifique a conexão.");
    }
  }
  const cards = [
    {
      label: "Pessoas cadastradas",
      value: stats?.total,
      icon: Users,
      color: "purple",
      detail: "Toda a comunidade em um lugar",
    },
    {
      label: "Cadastros ativos",
      value: stats?.active,
      icon: CircleCheck,
      color: "green",
      detail: "Vínculos ativos na instituição",
    },
    {
      label: "Pessoas físicas",
      value: stats?.individuals,
      icon: UserRound,
      color: "blue",
      detail: "Alunos, equipe e prestadores",
    },
    {
      label: "Pessoas jurídicas",
      value: stats?.companies,
      icon: Building2,
      color: "orange",
      detail: "Empresas e parceiros",
    },
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir para o conteúdo
      </a>
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <GraduationCap size={27} />
          </span>
          <span>
            elo<span className="brand-sub">ACADÊMICO</span>
          </span>
        </Link>
        <div className="workspace">
          <span className="workspace-icon">
            <Building2 size={18} />
          </span>
          <div>
            <strong>Ambiente acadêmico</strong>
            <small>Gestão institucional</small>
          </div>
        </div>
        <span className="nav-label">ESPAÇO DE TRABALHO</span>
        <nav aria-label="Menu principal">
          {nav.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "nav-item active" : "nav-item"}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => changeTab(item.id)}
            >
              <item.icon size={19} />
              {item.title}
              {tab === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-message">
            <span className="small-logo">
              <Network size={21} />
            </span>
            <strong>Uma gestão mais conectada.</strong>
            <p>
              Menos planilhas.
              <br />
              Mais tempo para as pessoas.
            </p>
            <button onClick={() => changeTab("help")}>
              Conheça o portal <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="sidebar-footer">
            <span className="online-dot" /> Projeto Integrador · TADS
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir menu"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span>Meu espaço</span>
            <ChevronRight size={14} />
            <strong>{nav.find((n) => n.id === tab)?.title}</strong>
          </div>
          <div className="account">
            <span className="environment">Demonstração acadêmica</span>
            <span className="account-divider" />
            <span className="avatar user-avatar">
              {user.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="user-info">
              <strong>{user.name}</strong>
              <small>
                {user.role === "admin" ? "Administração" : "Recursos Humanos"}
              </small>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              aria-label="Sair do portal"
              title="Sair do portal"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main id="main" className="main-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {tab === "people"
                  ? "CONEXÕES QUE FAZEM A DIFERENÇA"
                  : "SEU ESPAÇO DE GESTÃO"}
              </span>
              <h1>
                {tab === "people"
                  ? "Gestão de pessoas"
                  : tab === "overview"
                    ? "Uma visão de todos os elos."
                    : tab === "history"
                      ? "Cada mudança, registrada."
                      : "Vamos simplificar sua rotina."}
              </h1>
              <p>
                {tab === "people"
                  ? "Encontre, organize e cuide de quem faz parte da sua instituição."
                  : tab === "overview"
                    ? "Acompanhe os cadastros e os vínculos da comunidade acadêmica."
                    : tab === "history"
                      ? "Consulte quem alterou cada cadastro e quais informações mudaram."
                      : "Um guia rápido para aproveitar o Portal Elo Acadêmico."}
              </p>
            </div>
            {tab === "people" && (
              <button
                className="primary"
                onClick={() => setDialog({ person: null })}
              >
                <Plus size={19} /> Novo cadastro
              </button>
            )}
          </div>
          {notice && (
            <div className="success-banner" role="status">
              <CircleCheck size={19} />
              {notice}
              <button
                className="icon-button"
                aria-label="Dispensar mensagem"
                onClick={() => setNotice("")}
              >
                <X size={17} />
              </button>
            </div>
          )}
          {error && (
            <div className="error-banner" role="alert">
              {error}
              <button className="text-button" onClick={reload}>
                <RefreshCw size={15} /> Tentar novamente
              </button>
            </div>
          )}
          {(tab === "people" || tab === "overview") && (
            <section className="stats-grid" aria-label="Resumo dos cadastros">
              {cards.map((card) => (
                <article className="stat-card" key={card.label}>
                  <div className="stat-top">
                    <span>{card.label}</span>
                    <span className={`stat-icon ${card.color}`}>
                      <card.icon size={19} />
                    </span>
                  </div>
                  <strong className="stat-value">{card.value ?? "—"}</strong>
                  <small>{card.detail}</small>
                </article>
              ))}
            </section>
          )}
          {tab === "people" && (
            <section className="people-panel" aria-label="Lista de pessoas">
              <div className="panel-heading">
                <div>
                  <h2>
                    Todos os cadastros{" "}
                    <span className="count-pill">{people.total}</span>
                  </h2>
                  <p>Informações organizadas para uma rotina mais simples.</p>
                </div>
                <span className="panel-symbol">
                  <Users size={22} />
                </span>
              </div>
              <div className="filters">
                <label className="search-field">
                  <Search size={18} />
                  <input
                    aria-label="Buscar pessoas"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nome, CPF ou CNPJ…"
                  />
                  {query && (
                    <button
                      className="icon-button"
                      aria-label="Limpar busca"
                      onClick={() => setQuery("")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>
                <label className="filter-select">
                  <SlidersHorizontal size={16} />
                  <select
                    aria-label="Filtrar por vínculo"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Todos os vínculos</option>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <select
                  aria-label="Filtrar por tipo"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">PF e PJ</option>
                  <option value="PF">Pessoa física</option>
                  <option value="PJ">Pessoa jurídica</option>
                </select>
                <select
                  aria-label="Filtrar por situação"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todas as situações</option>
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>
              {(search || category || type || status) && (
                <div className="active-filters">
                  <span>Filtros aplicados</span>
                  <button className="text-button" onClick={clearFilters}>
                    Limpar filtros <X size={13} />
                  </button>
                </div>
              )}
              <div className="table-scroll" aria-busy={loading}>
                {loading ? (
                  <div className="loading-state" role="status">
                    <RefreshCw className="spin" size={23} /> Carregando
                    cadastros…
                  </div>
                ) : error ? (
                  <div className="empty-state">
                    <CircleHelp size={34} />
                    <h3>Não foi possível atualizar a lista</h3>
                    <p>Verifique a conexão e tente novamente.</p>
                    <button className="secondary" onClick={reload}>
                      Tentar novamente
                    </button>
                  </div>
                ) : people.items.length ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Pessoa / Razão social</th>
                        <th>Documento</th>
                        <th>Vínculo</th>
                        <th>Situação</th>
                        <th>Atualização</th>
                        <th>
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {people.items.map((person, index) => (
                        <tr key={person.id}>
                          <td>
                            <button
                              className="person-name"
                              onClick={() => setDialog({ person })}
                            >
                              <span className={`avatar tone-${index % 4}`}>
                                {person.type === "PJ" ? (
                                  <Building2 size={19} />
                                ) : (
                                  person.name
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join("")
                                )}
                              </span>
                              <span>
                                <strong>
                                  {person.socialName || person.name}
                                </strong>
                                <small>{person.email}</small>
                              </span>
                            </button>
                          </td>
                          <td>
                            <span className="document-text">
                              {formatDocument(person.document)}
                            </span>
                            <small className="cell-sub">
                              Pessoa{" "}
                              {person.type === "PF" ? "física" : "jurídica"}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`category-badge category-${person.category}`}
                            >
                              {person.category}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status ${person.status === "Ativo" ? "is-active" : ""}`}
                            >
                              <span />
                              {person.status}
                            </span>
                          </td>
                          <td className="date-cell">
                            {new Date(person.updatedAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </td>
                          <td>
                            <button
                              className="row-action"
                              aria-label={`Abrir cadastro de ${person.name}`}
                              onClick={() => setDialog({ person })}
                            >
                              <ArrowUpRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <Search size={36} />
                    <h3>Nenhum cadastro encontrado</h3>
                    <p>Tente outro nome ou documento, ou ajuste os filtros.</p>
                    <button className="secondary" onClick={clearFilters}>
                      Limpar filtros
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setDialog({ person: null })}
                    >
                      Criar um cadastro <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="table-footer">
                <span>
                  {people.total
                    ? `Mostrando ${(people.page - 1) * 8 + 1}–${Math.min(people.page * 8, people.total)} de ${people.total} cadastros`
                    : "Nenhum cadastro para exibir"}
                </span>
                <div className="pagination">
                  <button
                    className="icon-button"
                    aria-label="Página anterior"
                    disabled={people.page <= 1 || loading}
                    onClick={() => setPage(people.page - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span>
                    {people.page} / {people.pages}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Próxima página"
                    disabled={people.page >= people.pages || loading}
                    onClick={() => setPage(people.page + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </section>
          )}
          {tab === "overview" && (
            <div className="overview-grid">
              <section className="content-card">
                <h2>Uma comunidade, diferentes vínculos</h2>
                <p className="muted">
                  Distribuição dos cadastros da instituição.
                </p>
                <div className="category-chart">
                  {categories.map((category) => {
                    const count =
                      stats?.categories.find((c) => c.category === category)
                        ?.count || 0;
                    return (
                      <div key={category}>
                        <div>
                          <span>{category}</span>
                          <strong>{count}</strong>
                        </div>
                        <div className="chart-track">
                          <span
                            style={{
                              width: `${stats?.total ? (count / stats.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="content-card overview-callout">
                <Network size={36} />
                <h2>Cada pessoa importa.</h2>
                <p>
                  Uma base atualizada ajuda sua equipe a tomar decisões e
                  atender melhor.
                </p>
                <button className="primary" onClick={() => changeTab("people")}>
                  Consultar pessoas <ArrowRight size={17} />
                </button>
              </section>
              <section className="content-card span-two">
                <h2>Últimas movimentações</h2>
                <HistoryList items={history.slice(0, 4)} />
              </section>
            </div>
          )}
          {tab === "history" && (
            <section className="content-card">
              <div className="panel-heading no-padding">
                <div>
                  <h2>Histórico de alterações</h2>
                  <p>Últimos 100 eventos · registros de criação e edição</p>
                </div>
                <button className="secondary" onClick={reload}>
                  <RefreshCw size={16} /> Atualizar
                </button>
              </div>
              {loading ? (
                <p role="status">Carregando histórico…</p>
              ) : (
                <HistoryList items={history} />
              )}
            </section>
          )}
          {tab === "help" && (
            <div className="help-grid">
              {[
                {
                  number: "01",
                  title: "Encontre a pessoa certa",
                  text: "Busque pelo nome, nome social ou documento. Combine os filtros de vínculo, tipo de pessoa e situação para refinar os resultados.",
                },
                {
                  number: "02",
                  title: "Cadastre com clareza",
                  text: "Escolha PF ou PJ. Informe nome ou razão social, documento, vínculo e e-mail. Pessoas jurídicas são cadastradas como prestadores.",
                },
                {
                  number: "03",
                  title: "Revise antes de salvar",
                  text: "Abra uma ficha, atualize os campos e selecione Revisar dados. A alteração só é gravada depois da confirmação.",
                },
                {
                  number: "04",
                  title: "Acompanhe as mudanças",
                  text: "O histórico mostra responsável, data e valores alterados. Somente a administração pode ativar e inativar cadastros.",
                },
              ].map((item) => (
                <article className="content-card" key={item.number}>
                  <span className="help-number">{item.number}</span>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </article>
              ))}
              <div className="content-card span-two">
                <ShieldCheck size={25} />
                <h2>Sobre este ambiente</h2>
                <p>
                  Prova de conceito do Projeto Integrador TADS: Desenvolvimento
                  de Sistemas Orientados a Dispositivos Móveis e Baseados na
                  Web. Os cadastros iniciais são fictícios e destinados à
                  demonstração.
                </p>
                <p>
                  A jornada escolhida é a de Gustavo, do RH, consultando e
                  atualizando prestadores. Cada cadastro possui um vínculo
                  principal. Integração com sistemas externos, importação de
                  planilhas e CNPJ alfanumérico estão fora desta versão.
                </p>
              </div>
            </div>
          )}
          <footer className="main-footer">
            <span>
              <ShieldCheck size={15} /> Informações conectadas. Uma gestão mais
              humana.
            </span>
            <span>Elo Acadêmico · PI TADS</span>
          </footer>
        </main>
      </div>
      {dialog && (
        <PersonDialog
          person={dialog.person}
          user={user}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setNotice(
              dialog.person
                ? "Cadastro atualizado com sucesso. A alteração foi registrada no histórico."
                : "Cadastro criado com sucesso.",
            );
            setDialog(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
