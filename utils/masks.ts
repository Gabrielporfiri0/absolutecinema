
export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const limited = digits.slice(0, 11);

  if (limited.length <= 10) {
    return limited
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    return limited
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
}