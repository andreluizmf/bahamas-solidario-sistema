export function authReturnUrl({ hash = "", search = "" }) {
  const type = new URLSearchParams(hash.replace(/^#/, "")).get("type");
  return type === "invite" || type === "recovery"
    ? `/admin/nova-senha${search}${hash}`
    : null;
}

export function authFlowType(hash = "") {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.has("access_token") &&
    ["invite", "recovery"].includes(params.get("type"))
    ? "implicit"
    : "pkce";
}

if (typeof window !== "undefined") {
  const url = authReturnUrl(window.location);
  if (url) window.history.replaceState({}, "", url);
}
