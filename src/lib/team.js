export async function invokeTeamInvitation(client, values) {
  const { data, error } = await client.functions.invoke("manage-team", {
    body: { action: "invite", ...values },
  });
  if (error) {
    let detail;
    try {
      const response = error.context;
      const body = await (response.clone ? response.clone() : response).json();
      detail = body?.error;
    } catch {
      /* Network failures have no JSON response. */
    }
    throw new Error(
      detail ||
        "Não foi possível acessar o serviço de convites. Verifique sua conexão ou entre novamente no painel.",
    );
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.ok || !["link", "email", "existing"].includes(data.delivery))
    throw new Error(
      "O serviço de convites precisa ser atualizado. Tente novamente após atualizar a página.",
    );
  if (data.delivery === "link" && !data.invitationUrl)
    throw new Error(
      "O convite não retornou um link de acesso válido. Tente novamente.",
    );
  return data;
}
