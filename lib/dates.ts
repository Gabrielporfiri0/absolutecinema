
export function formatUTCToBR(dateUTC: string): string {
    const date = new Date(dateUTC);

    if (isNaN(date.getTime())) {
        return 'S/N'
    }

    const dia = String(date.getUTCDate()).padStart(2, "0");
    const mes = String(date.getUTCMonth() + 1).padStart(2, "0");
    const ano = date.getUTCFullYear();

    const hora = String(date.getUTCHours()).padStart(2, "0");
    const minuto = String(date.getUTCMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}