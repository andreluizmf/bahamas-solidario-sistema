export function authReturnUrl({ hash = "", search = "" }) {
  const type = new URLSearchParams(hash.replace(/^#/, "")).get("type");
  return type === "invite" || type === "recovery"
    ? `/admin/nova-senha${search}${hash}`
    : null;
}

if (typeof window !== "undefined") {
  const url = authReturnUrl(window.location);
  if (url) window.history.replaceState({}, "", url);
}
