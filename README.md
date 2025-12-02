## 🎬 CineUEMS

Sistema web desenvolvido para gerenciamento de reservas de assentos em sessões de cinema, criado como projeto acadêmico para a Universidade Estadual de Mato Grosso do Sul (UEMS).
O sistema possibilita que usuários realizem reservas de forma simples e que administradores controlem a ocupação e os registros.

-----

## 📌 Funcionalidades

### 👤 Usuário

  * Visualização do filme disponível
  * Seleção interativa de assentos
  * Identificação visual:
      * **🟩 Livre**
      * **🟨 Selecionado**
      * **🟥 Ocupado**
  * Reserva com nome e CPF
  * Validação automática de CPF
  * Máximo de 4 ingressos por CPF
  * Bloqueio de assentos já reservados
  * Exibição em tempo real dos assentos ocupados
  * Obrigatoriedade de assistir a um vídeo antes da reserva

### 🔐 Administrador

Acesso disponível em: `/admin/login`

  * Login com autenticação via token
  * Sessão salva em LocalStorage
  * Painel administrativo
  * Visualização de reservas
  * Exclusão de reservas
  * Atualização de reservas
  * Cadastro de administradores
  * Exclusão de administradores

-----

## 🛠️ Tecnologias Utilizadas

### Front-end

  * **Next.js**
  * **TypeScript**
  * **React**
  * **Tailwind CSS**
  * **Lucide React**
  * **Shadcn/UI**

### Back-end

  * **Next.js API Routes**
  * **Node.js (runtime)**

### Banco de Dados

  * **MongoDB**

### Segurança e Autenticação

  * **JWT (JSON Web Token)**
  * **Bcrypt.js**
  * **LocalStorage**

### Hospedagem e Infraestrutura (Deploy)

  * **Vercel**

-----

## 📂 Estrutura do Projeto

A estrutura do projeto segue as convenções do **Next.js App Router**, organizando os arquivos para facilitar o desenvolvimento e a manutenção:

  * **`.next`**: Diretório gerado pelo Next.js contendo *builds* e *cache*.
  * **`app/`**: Contém todas as rotas da aplicação, incluindo as páginas de usuário (`page.tsx`, `layout.tsx`) e a área administrativa (`admin/`).
      * **`admin/`**: Rotas e componentes específicos da área administrativa.
      * **`api/`**: **API Routes** do Next.js, onde estão implementados os *endpoints* do *backend*.
      * **`fale-conosco/`**, **`filme/`**: Exemplos de rotas de páginas.
      * **`layout.tsx`**: Layout principal da aplicação.
      * **`globals.css`**: Estilos globais.
  * **`components/`**: Componentes React reutilizáveis.
  * **`lib/`**: Funções úteis.
  * **`node_modules/`**: Dependências do projeto.
  * **`public/`**: Arquivos estáticos (imagens, *favicons*, etc.).
  * **`types/`**: Definições de tipos TypeScript.
  * **`.env`**: Arquivo para variáveis de ambiente (não rastreado pelo Git).
  * **`next.config.js`**, **`package.json`**, **`tsconfig.json`**: Arquivos de configuração do Next.js, dependências e TypeScript, respectivamente.

-----

## 🚀 Como Executar o Projeto

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/Gabrielporfiri0/absolutecinema.git
```

### 2️⃣ Configure as Variáveis de Ambiente

Crie um arquivo chamado **`.env`** na raiz do projeto e adicione as seguintes variáveis, preenchendo com seus respectivos valores:

```ini
# String de conexão para o seu banco de dados MongoDB local
URIMONGOLOCAL=sua_connection_string_aqui

# Segredo usado para assinar e verificar tokens JWT
# Mantenha este valor seguro e não o exponha em produção!
JWT_SECRET="SEU_SEGREDO_JWT_AQUI"
```

> **Nota:** Certifique-se de que o **MongoDB** esteja instalado e em execução em sua máquina.

### 3️⃣ Instale as dependências

```bash
npm i
```

### 4️⃣ Inicie o servidor

```bash
npm run dev
```

Acesse o sistema em:

```
http://localhost:3000
```

-----

## 🔑 Acesso Administrativo

```
http://localhost:3000/admin/login
```

Cadastre administradores diretamente pelo banco ou pela tela administrativa.

-----

## 🤝 Como Contribuir

Ficamos felizes com o seu interesse em contribuir\! Para propor melhorias, correções de *bugs* ou adicionar novas funcionalidades, siga os passos abaixo:

1.  **Faça um *Fork***: Crie uma cópia do repositório para a sua conta do GitHub.
2.  **Crie uma *Branch***: Crie uma *branch* com um nome descritivo (ex: `feature/nova-funcionalidade` ou `fix/correcao-login`).
    ```bash
    git checkout -b nome-da-sua-branch
    ```
3.  **Faça as Alterações**: Implemente suas mudanças no código.
4.  **Faça o *Commit***: Descreva suas alterações de forma clara.
    ```bash
    git commit -m "feat: Adiciona funcionalidade X"
    ```
5.  **Faça o *Push***: Envie suas alterações para o seu *fork*.
    ```bash
    git push origin nome-da-sua-branch
    ```
6.  **Abra um *Pull Request***: No GitHub, abra um *Pull Request* do seu *fork* para a *branch* principal deste repositório, descrevendo detalhadamente as mudanças e o motivo.

-----

## 📄 Licença

Projeto com finalidade educacional.
Uso livre para fins acadêmicos.

-----

## 👨‍💻 Desenvolvedores

Projeto desenvolvido por estudantes da UEMS
Curso: Sistemas de Informação

-----

## 📞 Suporte

Em caso de dúvidas ou melhorias, entre em contato com os desenvolvedores do projeto.

-----

🎥 *CineUEMS — Sua sessão começa aqui\!* 🍿

-----
