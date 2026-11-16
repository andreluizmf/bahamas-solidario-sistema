import React, { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LoaderCircle,
  X,
} from "lucide-react";
import { number } from "../lib/domain";
import { fieldError } from "../lib/ux";
import { useUnsavedChanges } from "../lib/use-unsaved";

export function Button({ children, variant = "primary", loading, ...props }) {
  return (
    <button
      {...props}
      className={`button ${variant} ${props.className || ""}`}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <LoaderCircle size={16} className="spin" />}
      {children}
    </button>
  );
}
export function Icon({ as: Component, ...props }) {
  return (
    <span className="icon-tile">
      <Component size={20} {...props} />
    </span>
  );
}
export function Empty({
  title = "Nenhum registro por aqui",
  children,
  action,
}) {
  return (
    <div className="empty">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={24} />
      <span>Carregando informações…</span>
    </div>
  );
}
export function ErrorBox({ error, retry }) {
  return (
    <div role="alert" className="error-box">
      <strong>Não foi possível carregar as informações.</strong>
      <p>{error}</p>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
export function Progress({ value, label }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label || "Progresso da meta"}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function Metric({ label, value, hint, icon: Component, featured }) {
  return (
    <article className={`metric-card ${featured ? "featured" : ""}`}>
      <div>
        <span>{label}</span>
        {Component && <Component size={20} />}
      </div>
      <strong>{typeof value === "number" ? number(value) : value}</strong>
      <small>{hint}</small>
    </article>
  );
}
export function Field({ label, hint, children, className = "" }) {
  const id = useId();
  const [error, setError] = useState("");
  const isControl =
    React.isValidElement(children) &&
    ["input", "select", "textarea"].includes(children.type);
  const child = isControl
    ? React.cloneElement(children, {
        id: children.props.id || id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby":
          [
            children.props["aria-describedby"],
            hint ? `${id}-hint` : "",
            error ? `${id}-error` : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined,
        onInvalid: (event) => {
          event.preventDefault();
          setError(fieldError(event.currentTarget, label));
          children.props.onInvalid?.(event);
        },
        onChange: (event) => {
          if (error) setError(fieldError(event.currentTarget, label));
          children.props.onChange?.(event);
        },
      })
    : children;
  return (
    <label
      className={`field ${className}`}
      htmlFor={isControl ? children.props.id || id : undefined}
    >
      <span>
        {label}
        {isControl && children.props.required && (
          <span className="required-mark" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </span>
      {child}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <small className="field-error" id={`${id}-error`}>
          {error}
        </small>
      )}
    </label>
  );
}
export function Form({ children, ...props }) {
  const ref = useRef(null);
  const queued = useRef(false);
  const [invalid, setInvalid] = useState(false);
  return (
    <form
      {...props}
      ref={ref}
      onInvalidCapture={(event) => {
        event.preventDefault();
        setInvalid(true);
        if (!queued.current) {
          queued.current = true;
          requestAnimationFrame(() => {
            queued.current = false;
            ref.current
              ?.querySelector("input:invalid,select:invalid,textarea:invalid")
              ?.focus();
          });
        }
      }}
      onInput={(event) => {
        if (!ref.current?.querySelector(":invalid")) setInvalid(false);
        props.onInput?.(event);
      }}
    >
      {invalid && (
        <p className="form-error" role="alert">
          Confira os campos destacados antes de continuar.
        </p>
      )}
      {children}
    </form>
  );
}
export function FormSection({ title, description, children }) {
  return (
    <fieldset className="form-section">
      <legend>{title}</legend>
      {description && <p className="form-help">{description}</p>}
      {children}
    </fieldset>
  );
}
export function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function SectionHead({ title, text, action }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {text && <p className="muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  dirty,
  busy = false,
}) {
  const ref = useRef(null);
  const [discard, setDiscard] = useState(false);
  const [savedDirty, setSavedDirty] = useState(false);
  const hasChanges = dirty ?? savedDirty;
  useUnsavedChanges(hasChanges);
  const closeRef = useRef(onClose);
  const requestClose = () => {
    if (busy) return;
    if (hasChanges) setDiscard(true);
    else onClose();
  };
  closeRef.current = requestClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const key = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const items = [
        ...ref.current.querySelectorAll(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",
        ),
      ].filter((e) => e.getClientRects().length && !e.closest("[inert]"));
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0],
        last = items.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <section
        className={`modal ${wide ? "wide" : ""}`}
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onInputCapture={() => setSavedDirty(true)}
        onClickCapture={(event) => {
          if (event.target.closest("[data-close-modal]")) {
            event.preventDefault();
            event.stopPropagation();
            requestClose();
          }
        }}
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Fechar janela"
            onClick={requestClose}
            disabled={busy}
          >
            <X size={20} />
          </button>
        </div>
        {discard && (
          <div className="discard-warning" role="alert">
            <h3>Descartar as alterações?</h3>
            <p>O que você editou ainda não foi salvo.</p>
            <div className="inline">
              <Button
                autoFocus
                variant="secondary"
                onClick={() => {
                  setDiscard(false);
                  requestAnimationFrame(() => ref.current?.focus());
                }}
              >
                Continuar editando
              </Button>
              <Button variant="danger" onClick={onClose}>
                Descartar alterações
              </Button>
            </div>
          </div>
        )}
        <div inert={discard ? "" : undefined} hidden={discard}>
          {children}
        </div>
      </section>
    </div>
  );
}
export function Paginated({ items, render, pageSize = 10 }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages);
  return (
    <>
      {render(items.slice((current - 1) * pageSize, current * pageSize))}
      {items.length > pageSize && (
        <div className="pagination">
          <span>
            {number(items.length)} registros · Página {current} de {pages}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Página anterior"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Próxima página"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
export function TextLink({ children, ...props }) {
  return (
    <a {...props} className="text-link">
      {children}
      <ArrowRight size={15} />
    </a>
  );
}
