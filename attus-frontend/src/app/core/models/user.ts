export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  phoneType: 'celular' | 'residencial' | 'trabalho' | 'comercial';
}
