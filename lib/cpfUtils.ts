
// 1. Formata o CPF visualmente (000.000.000-00)
export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 3º digito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 6º digito
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca traço após o 9º digito
    .replace(/(-\d{2})\d+?$/, '$1'); // Impede digitar mais que 11 dígitos
};

// 2. Valida matematicamente se o CPF é real
export const validateCPF = (cpf: string) => {
  const strCPF = cpf.replace(/[^\d]+/g, ''); // Remove pontos e traços
  if (strCPF === '') return false;
  
  // Elimina CPFs invalidos conhecidos (ex: 111.111.111-11)
  if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;

  let sum;
  let rest;
  sum = 0;
  
  for (let i = 1; i <= 9; i++) 
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(strCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) 
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(strCPF.substring(10, 11))) return false;
  
  return true;
};