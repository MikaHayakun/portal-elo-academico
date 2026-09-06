"use client";
import { useEffect, useRef, useState } from "react";
import {
  X,
  ArrowLeft,
  Check,
  Save,
  History,
  UserRound,
  Building2,
} from "lucide-react";
import {
  categories,
  fieldLabels,
  formatDocument,
  personSchema,
  type Person,
  type PersonInput,
  type User,
  type Audit,
} from "@/lib/domain";
const blank: PersonInput = {
  type: "PF",
  name: "",
  socialName: "",
  document: "",
  email: "",
  phone: "",
  category: "Prestador",
  status: "Ativo",
  notes: "",
};
export function HistoryList({ items }: { items: Audit[] }) {
  if (!items.length)
    return <p className="muted">Nenhuma alteração registrada.</p>;
  return (
    <div className="timeline">
      {items.map((item) => (
        <article key={item.id}>
          <span className="timeline-dot" />
          <div>
            <strong>
              {item.action} · {item.personName}
            </strong>
            <p>
              {item.actor} · {new Date(item.createdAt).toLocaleString("pt-BR")}
            </p>
            <details>
              <summary>
                {Object.keys(item.changes).length} campo(s) registrado(s)
              </summary>
              <dl>
                {Object.entries(item.changes).map(([key, change]) => (
                  <div key={key}>
                    <dt>{fieldLabels[key] || key}</dt>
                    <dd>
                      {change.before || "Não informado"}{" "}
                      <span aria-label="alterado para">→</span>{" "}
                      {change.after || "Não informado"}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
        </article>
      ))}
    </div>
  );
}
export default function PersonDialog({
  person,
  user,
  onClose,
  onSaved,
}: {
  person: Person | null;
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<PersonInput>(person || blank);
  const [step, setStep] = useState<"edit" | "review" | "history">("edit");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Audit[]>([]);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  function close() {
    if (busy) return;
    const dirty =
      JSON.stringify(
        person
          ? Object.fromEntries(
              Object.keys(blank).map((k) => [k, person[k as keyof Person]]),
            )
          : blank,
      ) !==
      JSON.stringify(
        Object.fromEntries(
          Object.keys(blank).map((k) => [k, form[k as keyof PersonInput]]),
        ),
      );
    if (dirty && !window.confirm("Descartar as alterações não salvas?")) return;
    onClose();
  }
  function update(key: keyof PersonInput, value: string) {
    setForm((old) => ({
      ...old,
      [key]: value,
      ...(key === "type" && value === "PJ"
        ? { category: "Prestador", socialName: "" }
        : {}),
    }));
    setFields((old) => ({ ...old, [key]: "" }));
  }
  function review(event: React.FormEvent) {
    event.preventDefault();
    const result = personSchema.safeParse(form);
    if (!result.success) {
      setFields(
        Object.fromEntries(
          result.error.issues.map((i) => [i.path[0], i.message]),
        ),
      );
      setError("Confira os campos destacados.");
      return;
    }
    setForm(result.data);
    setError("");
    setFields({});
    setStep("review");
  }
  async function save() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        person ? `/api/people/${person.id}` : "/api/people",
        {
          method: person ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, version: person?.version }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function showHistory() {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/people/${person?.id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setHistory(data.history);
      setStep("history");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o histórico.",
      );
    } finally {
      setBusy(false);
    }
  }
  function input(
    key: keyof PersonInput,
    title: string,
    required = false,
    type = "text",
  ) {
    return (
      <label>
        {title}
        {required && <span aria-hidden="true"> *</span>}
        <input
          name={key}
          type={type}
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          required={required}
          maxLength={
            key === "email"
              ? 160
              : key === "document"
                ? 18
                : key === "phone"
                  ? 25
                  : 120
          }
          aria-invalid={!!fields[key]}
          aria-describedby={fields[key] ? `error-${key}` : undefined}
        />
        {fields[key] && (
          <small className="field-error" id={`error-${key}`}>
            {fields[key]}
          </small>
        )}
      </label>
    );
  }
  return (
    <dialog
      ref={dialog}
      className="person-dialog"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-header">
        <div>
          <span className="eyebrow">GESTÃO DE PESSOAS</span>
          <h2 id="dialog-title">
            {step === "review"
              ? "Revisar e confirmar"
              : step === "history"
                ? "Histórico do cadastro"
                : person
                  ? "Ficha cadastral"
                  : "Novo cadastro"}
          </h2>
        </div>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Fechar cadastro"
          disabled={busy}
        >
          <X />
        </button>
      </div>
      <div className="dialog-body">
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        {step === "edit" ? (
          <form id="person-form" onSubmit={review} noValidate>
            <p className="muted">
              {person
                ? "Consulte os dados e atualize o que for necessário."
                : "Conecte uma nova pessoa à sua instituição."}{" "}
              Campos com * são obrigatórios.
            </p>
            <fieldset className="type-switch">
              <legend>Tipo de pessoa</legend>
              {(["PF", "PJ"] as const).map((type) => (
                <label
                  key={type}
                  className={form.type === type ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="personType"
                    value={type}
                    checked={form.type === type}
                    onChange={() => update("type", type)}
                  />
                  {type === "PF" ? (
                    <UserRound size={18} />
                  ) : (
                    <Building2 size={18} />
                  )}{" "}
                  Pessoa {type === "PF" ? "física" : "jurídica"}
                </label>
              ))}
            </fieldset>
            <div className="form-grid">
              <div className="span-two">
                {input(
                  "name",
                  form.type === "PF" ? "Nome completo" : "Razão social",
                  true,
                )}
              </div>
              {form.type === "PF" && (
                <div className="span-two">
                  {input("socialName", "Nome social (opcional)")}
                </div>
              )}
              {input(
                "document",
                form.type === "PF" ? "CPF" : "CNPJ numérico",
                true,
              )}
              <label>
                Vínculo institucional *
                <select
                  name="category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  disabled={form.type === "PJ"}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {fields.category && (
                  <small className="field-error">{fields.category}</small>
                )}
              </label>
              {input("email", "E-mail", true, "email")}
              {input("phone", "Telefone")}
              <label>
                Situação
                <select
                  aria-label="Situação do cadastro"
                  name="status"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  disabled={user.role !== "admin"}
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
                {user.role !== "admin" && (
                  <small className="muted">
                    Alteração disponível à administração.
                  </small>
                )}
              </label>
              <label className="span-two">
                Observações
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
              </label>
            </div>
          </form>
        ) : step === "review" ? (
          <>
            <div className="review-banner">
              <Check size={22} />
              <div>
                <strong>Está tudo certo?</strong>
                <p>A gravação será realizada ao confirmar abaixo.</p>
              </div>
            </div>
            <dl className="review-grid">
              {Object.entries(form).map(([key, value]) => (
                <div key={key}>
                  <dt>{fieldLabels[key]}</dt>
                  <dd>
                    {key === "document"
                      ? formatDocument(value)
                      : value || "Não informado"}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <HistoryList items={history} />
        )}
      </div>
      <div className="dialog-footer">
        {step === "edit" ? (
          <>
            {person ? (
              <button
                className="secondary"
                onClick={showHistory}
                disabled={busy}
              >
                <History size={17} /> Histórico
              </button>
            ) : (
              <button className="secondary" onClick={close}>
                Cancelar
              </button>
            )}
            <button
              className="primary"
              type="submit"
              form="person-form"
              disabled={busy}
            >
              Revisar dados <ArrowLeft className="rotate" size={17} />
            </button>
          </>
        ) : (
          <>
            <button
              className="secondary"
              disabled={busy}
              onClick={() => {
                setStep("edit");
                setError("");
              }}
            >
              <ArrowLeft size={17} /> Voltar
            </button>
            {step === "review" && (
              <button className="primary" disabled={busy} onClick={save}>
                <Save size={17} />
                {busy ? "Salvando…" : "Confirmar e salvar"}
              </button>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
