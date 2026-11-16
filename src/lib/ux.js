export function normalizeSearch(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

export function fieldError(input, label = "Este campo") {
  const validity = input.validity;
  if (validity.valueMissing)
    return `Preencha ${label.toLocaleLowerCase("pt-BR")}.`;
  if (validity.typeMismatch && input.type === "email")
    return "Informe um e-mail válido, como nome@empresa.com.br.";
  if (validity.tooShort) return `Use pelo menos ${input.minLength} caracteres.`;
  if (validity.rangeUnderflow)
    return input.type === "date"
      ? "Confira a data: ela não pode ser anterior ao início."
      : `Informe um valor igual ou maior que ${input.min}.`;
  if (validity.rangeOverflow)
    return input.type === "date"
      ? "A data não pode estar no futuro."
      : `Informe um valor igual ou menor que ${input.max}.`;
  if (validity.badInput || validity.stepMismatch)
    return "Confira o número informado e as casas decimais.";
  return validity.valid ? "" : "Confira o valor informado neste campo.";
}

export const unsavedEditors = new Set();
export function confirmNavigation() {
  return (
    !unsavedEditors.size ||
    window.confirm("Você tem alterações não salvas. Continuar e descartá-las?")
  );
}
