
// 1. Formata o CPF visualmente (000.000.000-00)
export const mascaraCPF = (valor: string) => {
  return valor
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 3º digito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 6º digito
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca traço após o 9º digito
    .replace(/(-\d{2})\d+?$/, '$1'); // Impede digitar mais que 11 dígitos
};

// 2. Valida matematicamente se o CPF é real
export const validarCPF = (cpf: string) => {
  const strCPF = cpf.replace(/[^\d]+/g, ''); // Remove pontos e traços
  if (strCPF === '') return false;
  
  // Elimina CPFs invalidos conhecidos (ex: 111.111.111-11)
  if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;

  let soma;
  let resto;
  soma = 0;
  
  for (let i = 1; i <= 9; i++) 
    soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(strCPF.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) 
    soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(strCPF.substring(10, 11))) return false;
  
  return true;
};