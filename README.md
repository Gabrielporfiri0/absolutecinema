# 🎬 CineUEMS

Sistema web desenvolvido para gerenciamento de reservas de assentos em sessões de cinema, criado como projeto acadêmico para a Universidade Estadual de Mato Grosso do Sul (UEMS).  
O sistema possibilita que usuários realizem reservas de forma simples e que administradores controlem a ocupação e os registros.

---

## 📌 Funcionalidades

### 👤 Usuário
- Visualização do filme disponível
- Seleção interativa de assentos
- Identificação visual:
  - 🟩 Livre  
  - 🟨 Selecionado  
  - 🟥 Ocupado
- Reserva com nome e CPF
- Validação automática de CPF
- Máximo de 4 ingressos por CPF
- Bloqueio de assentos já reservados
- Exibição em tempo real dos assentos ocupados
- Obrigatoriedade de assistir a um vídeo antes da reserva

### 🔐 Administrador
Acesso disponível em: `/admin/login`

- Login com autenticação via token
- Sessão salva em LocalStorage
- Painel administrativo
- Visualização de reservas
- Exclusão de reservas
- Cadastro de administradores
- Exclusão de administradores

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- Next.js  
- TypeScript:  
- React
- Tailwind CSS
- Lucide React
- Shadcn/UI 

### Back-end
- Next.js API Routes
- Node.js 
- Express.js

### Banco de Dados
- MongoDB
- MongoDB Native Driver

### Segurança e Autenticação
- JWT (JSON Web Token)
- Bcrypt.js
- LocalStorage

### Hospedagem e Infraestrutura (Deploy)
- Vercel

---

## 📂 Estrutura do Projeto

```
CineUEMS/
│
├── public/             # Arquivos estáticos
│   ├── css/
│   ├── js/
│   └── images/
│
├── routes/             # Rotas do sistema
├── db/                 # Configuração do banco de dados
├── views/              # Telas HTML
├── server.js           # Arquivo principal
└── package.json        # Dependências
```

---

## 🚀 Como Executar o Projeto

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/Gabrielporfiri0/absolutecinema.git
```

### 2️⃣ Instale as dependências
```bash
npm i
```

### 3️⃣ Inicie o servidor
```bash
npm run dev
```

Acesse o sistema em:
```
http://localhost:3000
```

---

## 🔑 Acesso Administrativo

```
http://localhost:3000/admin/login
```

Cadastre administradores diretamente pelo banco ou pela tela administrativa.

---

## 📄 Licença

Projeto com finalidade educacional.  
Uso livre para fins acadêmicos.

---

## 👨‍💻 Desenvolvedores

Projeto desenvolvido por estudantes da UEMS  
Curso: Sistemas de Informação

---

## 📞 Suporte

Em caso de dúvidas ou melhorias, entre em contato com os desenvolvedores do projeto.

---

🎥 *CineUEMS — Sua sessão começa aqui!* 🍿
