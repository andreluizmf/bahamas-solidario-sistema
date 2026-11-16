import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  LockKeyhole,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import Public from "./pages/Public";
import Admin from "./pages/Admin";
import { Button, ErrorBox, Field, Form, Loading } from "./components/ui";
import { configured, getPublicData, message, supabase } from "./lib/data";
import { confirmNavigation } from "./lib/ux";

const NavigationContext = createContext(null);
function AppLink({ to, children, ...props }) {
  const navigate = useContext(NavigationContext);
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          !event.defaultPrevented &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0
        ) {
          event.preventDefault();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
}

function usePath() {
  const [path, setPath] = useState(
    window.location.pathname.replace(/\/$/, "") || "/",
  );
  const position = useRef(window.history.state?.bsPosition || 0);
  const restoring = useRef(false);
  useEffect(() => {
    window.history.replaceState(
      { ...window.history.state, bsPosition: position.current },
      "",
    );
    const pop = (event) => {
      if (restoring.current) {
        restoring.current = false;
        return;
      }
      const nextPosition = event.state?.bsPosition ?? position.current - 1;
      if (!confirmNavigation()) {
        restoring.current = true;
        window.history.go(position.current - nextPosition || 1);
        return;
      }
      position.current = nextPosition;
      setPath(window.location.pathname.replace(/\/$/, "") || "/");
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  const navigate = useCallback((to, options = {}) => {
    if (to === window.location.pathname) return;
    if (!options.confirmed && !confirmNavigation()) return;
    position.current += 1;
    window.history.pushState({ bsPosition: position.current }, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return [path, navigate];
}
export default function App() {
  const [path, navigate] = usePath();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(configured);
  const [authError, setAuthError] = useState("");
  const [dark, setDark] = useState(
    () => localStorage.getItem("bs-dark-mode") === "true",
  );
  const Link = AppLink;
  const notify = (text, tone = "success") => setToast({ text, tone });
  const load = async () => {
    setError("");
    try {
      setData(await getPublicData());
    } catch (e) {
      setError(message(e));
    }
  };
  useEffect(() => {
    load();
    setMobile(false);
    document.title = `${path.startsWith("/admin") ? "Administração" : path === "/campanhas" ? "Campanhas" : path === "/transparencia" ? "Transparência" : "Comunidade"} | Bahamas Solidário`;
  }, [path]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const heading = document.querySelector("main h1, #admin-main h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [path, Boolean(data), authLoading]);
  useEffect(() => {
    const escape = (event) => {
      if (event.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("bs-dark-mode", String(dark));
  }, [dark]);
  useEffect(() => {
    if (!toast || toast.tone === "error") return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!configured) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAuthError(message(error));
        setAuthLoading(false);
      } else {
        setUser(data.session?.user || null);
        if (!data.session) setAuthLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (!session) {
          setAdmin(null);
          setAuthLoading(false);
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!configured || !user) return;
    let cancelled = false;
    setAuthLoading(true);
    setAuthError("");
    supabase
      .from("administrators")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setAdmin(data);
        setAuthError(
          error
            ? message(error)
            : !data
              ? "Sua conta está autenticada, mas não possui acesso administrativo. Solicite autorização à equipe."
              : "",
        );
        setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  const signOut = async () => {
    if (!confirmNavigation()) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      notify(message(error), "error");
      return;
    }
    setUser(null);
    setAdmin(null);
    navigate("/admin", { confirmed: true });
  };
  const isAdmin = path.startsWith("/admin");
  let body;
  if (isAdmin) {
    if (path === "/admin/nova-senha")
      body = (
        <Auth
          Link={Link}
          mode="password"
          user={user}
          notify={notify}
          navigate={navigate}
        />
      );
    else if (authLoading) body = <Loading />;
    else if (authError && user)
      body = (
        <div className="auth-page">
          <div className="auth-card">
            <ShieldCheck size={32} />
            <h1>Acesso restrito</h1>
            <p role="alert">{authError}</p>
            <Button onClick={signOut}>Sair da conta</Button>
            <Link className="text-link" to="/">
              Voltar ao portal
            </Link>
          </div>
        </div>
      );
    else if (!configured && !path.startsWith("/admin/previa"))
      body = <Auth Link={Link} notify={notify} navigate={navigate} />;
    else if (configured && !admin)
      body = <Auth Link={Link} notify={notify} navigate={navigate} />;
    else
      body = (
        <Admin
          path={!configured ? path.replace("/admin/previa", "/admin") : path}
          Link={Link}
          user={user}
          admin={admin}
          notify={notify}
          onSignOut={signOut}
        />
      );
  } else
    body = (
      <>
        <a className="skip-link" href="#public-main">
          Ir para o conteúdo
        </a>
        {!configured && (
          <div className="preview-banner">
            Prévia visual · Dados de exemplo · A conexão com o Supabase ainda
            não foi configurada.
          </div>
        )}
        <header className="public-header">
          <div className="public-container header-inner">
            <Link to="/" className="brand">
              <img src="/logo2.png" alt="Grupo Bahamas" />
              <span>
                Solidário<span className="brand-dot">.</span>
              </span>
            </Link>
            <nav
              className={mobile ? "public-nav open" : "public-nav"}
              aria-label="Menu principal"
              id="public-navigation"
            >
              {[
                ["/", "Início"],
                ["/campanhas", "Campanhas"],
                ["/transparencia", "Transparência"],
                ["/sobre", "Sobre nós"],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={path === to ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              <button
                className="icon-button theme-button"
                aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
                onClick={() => setDark(!dark)}
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <Link to="/como-doar" className="button primary small">
                <Heart size={15} />
                Como doar
              </Link>
              <button
                className="icon-button mobile-menu"
                aria-label={mobile ? "Fechar menu" : "Abrir menu"}
                aria-expanded={mobile}
                aria-controls="public-navigation"
                onClick={() => setMobile(!mobile)}
              >
                {mobile ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </header>
        <main id="public-main">
          {error ? (
            <div className="public-container page-space">
              <ErrorBox error={error} retry={load} />
            </div>
          ) : data ? (
            <Public path={path} data={data} Link={Link} notify={notify} />
          ) : (
            <Loading />
          )}
        </main>
        <footer className="public-footer public-container">
          <div>
            <Link className="brand footer-brand" to="/">
              <img src="/logo2.png" alt="Grupo Bahamas" />
              <span>
                Solidário<span className="brand-dot">.</span>
              </span>
            </Link>
            <p>
              Uma comunidade mais forte
              <br />
              começa com cuidado.
            </p>
          </div>
          <div>
            <strong>Faça parte</strong>
            <Link to="/campanhas">Campanhas</Link>
            <Link to="/como-doar">Como doar</Link>
            <Link to="/transparencia">Transparência</Link>
          </div>
          <div>
            <strong>Institucional</strong>
            <Link to="/sobre">Sobre o projeto</Link>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/admin">
              Acesso administrativo
              <LockKeyhole size={12} />
            </Link>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Bahamas Solidário.</span>
            <span>Solidariedade que aproxima.</span>
          </div>
        </footer>
      </>
    );
  return (
    <NavigationContext.Provider value={navigate}>
      {body}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast && (
          <div
            className={`toast ${toast.tone}`}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <CheckCircle2 size={18} />
            <span>{toast.text}</span>
            <button aria-label="Fechar aviso" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </NavigationContext.Provider>
  );
}
function Auth({ Link, mode = "login", user, notify, navigate }) {
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const passwordMode = mode === "password";
  const [showPassword, setShowPassword] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      if (passwordMode) {
        if (f.get("password") !== f.get("confirmation"))
          throw new Error("As senhas precisam ser iguais.");
        const { error } = await supabase.auth.updateUser({
          password: f.get("password"),
        });
        if (error) throw error;
        notify("Senha definida com sucesso.");
        navigate("/admin");
      } else if (reset) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          String(f.get("email")).trim(),
          { redirectTo: `${window.location.origin}/admin/nova-senha` },
        );
        if (error) throw error;
        notify(
          "Se o e-mail estiver cadastrado, você receberá as orientações para redefinir a senha.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: String(f.get("email")).trim(),
          password: f.get("password"),
        });
        if (error) throw error;
      }
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <Link to="/" className="auth-back">
        ← Voltar ao portal público
      </Link>
      <div className="auth-grid">
        <section className="auth-intro">
          <div className="brand">
            <img src="/logo2.png" alt="Grupo Bahamas" />
            <span>Solidário.</span>
          </div>
          <h1>
            Organizar o cuidado.
            <br />
            Ampliar o impacto.
          </h1>
          <p>
            Campanhas, doações e informações em um só lugar. Mais clareza para
            quem faz a solidariedade acontecer.
          </p>
          <div className="auth-trust">
            <ShieldCheck size={24} />
            <span>
              Acesso exclusivo para
              <br />a equipe autorizada.
            </span>
          </div>
        </section>
        <section className="auth-card">
          <span className="icon-tile">
            <LockKeyhole size={23} />
          </span>
          <h2>
            {passwordMode
              ? "Definir nova senha"
              : reset
                ? "Recuperar acesso"
                : "Bem-vindo de volta."}
          </h2>
          <p className="muted">
            {passwordMode
              ? "Crie uma senha com pelo menos 12 caracteres."
              : reset
                ? "Informe seu e-mail para receber as instruções."
                : "Entre com sua conta administrativa para continuar."}
          </p>
          {!configured ? (
            <div className="setup-message">
              <p>
                O portal ainda está em configuração. Nenhum login de
                demonstração concede acesso a dados reais.
              </p>
              <Link to="/admin/previa" className="button secondary">
                Conhecer o painel
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : passwordMode && !user ? (
            <div className="error-box">
              <p>
                Abra o link de convite ou recuperação enviado ao seu e-mail.
              </p>
              <Link to="/admin">Voltar ao acesso</Link>
            </div>
          ) : (
            <Form onSubmit={submit}>
              <fieldset disabled={busy}>
                {!passwordMode && (
                  <Field label="E-mail">
                    <input
                      autoComplete="username"
                      name="email"
                      type="email"
                      placeholder="seu.email@empresa.com.br"
                      required
                      maxLength={254}
                    />
                  </Field>
                )}
                {(!reset || passwordMode) && (
                  <Field label={passwordMode ? "Nova senha" : "Senha"}>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        passwordMode ? "new-password" : "current-password"
                      }
                      required
                      minLength={passwordMode ? 12 : 1}
                      maxLength={128}
                    />
                  </Field>
                )}
                {(!reset || passwordMode) && (
                  <label className="password-toggle">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(event) =>
                        setShowPassword(event.target.checked)
                      }
                    />
                    Mostrar senha
                  </label>
                )}
                {passwordMode && (
                  <Field label="Confirme a senha">
                    <input
                      name="confirmation"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={12}
                      required
                      maxLength={128}
                    />
                  </Field>
                )}
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
                <Button type="submit" loading={busy} className="full-width">
                  {passwordMode
                    ? "Salvar nova senha"
                    : reset
                      ? "Enviar instruções"
                      : "Entrar na administração"}
                  <ArrowRight size={16} />
                </Button>
                {!passwordMode && (
                  <button
                    className="plain-button"
                    type="button"
                    onClick={() => {
                      setReset(!reset);
                      setError("");
                    }}
                  >
                    {reset ? "Voltar ao login" : "Esqueci minha senha"}
                  </button>
                )}
              </fieldset>
            </Form>
          )}
          <p className="auth-footnote">
            Se você faz parte da equipe e ainda não tem acesso, solicite um
            convite ao administrador.
          </p>
        </section>
      </div>
    </main>
  );
}
