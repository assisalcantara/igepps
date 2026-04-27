export const formatters = {
  somenteDigitos: (s = "") => (s || "").replace(/\D/g, ""),
  formatarCPF: (cpf = "") => {
    const d = (cpf||"").replace(/\D/g, "");
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").slice(0,14);
  },
  formatarWhatsApp: (w = "") => {
    const d = (w||"").replace(/\D/g, "");
    return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").slice(0,15);
  },
  formatarData: (d) => d ? new Date(d).toLocaleDateString("pt-BR") : ""
};
