"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
export default function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar. Tente novamente.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Link className="brand" href="/login">
          <span className="brand-mark">
            <GraduationCap />
          </span>
          <span>
            elo<span className="brand-sub">ACADÊMICO</span>
          </span>
        </Link>
        <div className="story-content">
          <span className="eyebrow light">
            PESSOAS CONECTADAS. GESTÃO SIMPLIFICADA.
          </span>
          <h1>
            O próximo capítulo
            <br />
            da sua gestão
            <br />
            <em>começa aqui.</em>
          </h1>
          <p>
            Uma visão completa das pessoas que fazem parte da sua instituição.
            Tudo no mesmo lugar.
          </p>
          <div className="story-card">
            <span className="round-icon">
              <Users />
            </span>
            <div>
              <strong>Mais conexão, menos burocracia.</strong>
              <span>Secretaria e RH trabalhando em sintonia.</span>
            </div>
          </div>
        </div>
        <small>Portal Elo Acadêmico · Projeto Integrador TADS</small>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
      </section>
      <section className="login-form-side">
        <div className="login-box">
          <span className="eyebrow">BEM-VINDO AO ELO</span>
          <h2>Bom ter você por aqui.</h2>
          <p className="muted">Entre na sua conta para acessar o portal.</p>
          <form onSubmit={submit}>
            <label>
              E-mail institucional
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="seu.email@instituicao.edu.br"
                required
                maxLength={160}
              />
            </label>
            <label>
              Senha
              <div className="password-wrap">
                <input
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Informe sua senha"
                  required
                  maxLength={200}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error && (
              <div className="error-banner" role="alert">
                {error}
              </div>
            )}
            <button className="primary full" disabled={busy}>
              {busy ? "Entrando…" : "Entrar no portal"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="login-note">
            <ShieldCheck size={17} /> Acesso restrito à equipe autorizada.
          </p>
          <details className="login-help">
            <summary>Primeiro acesso à demonstração?</summary>
            <p>
              Execute <code>npm run setup</code>. Utilize{" "}
              <strong>admin@elo.local</strong> ou{" "}
              <strong>gustavo@elo.local</strong> com a senha gerada no arquivo{" "}
              <code>.env.local</code>. Solicite os dados de acesso ao
              responsável pelo ambiente.
            </p>
          </details>
        </div>
        <footer>Organização que aproxima pessoas.</footer>
      </section>
    </main>
  );
}
