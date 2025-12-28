# 💰 Financy - Sistema de Gestão Financeira

Sistema de gestão financeira pessoal desenvolvido com Next.js e shadcn/ui.

## 🚀 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript 5
- **Estilização**: TailwindCSS 4
- **Componentes UI**: shadcn/ui (Radix UI + Tailwind)
- **Ícones**: Lucide React
- **Fonte**: Inter (Google Fonts)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura do Projeto

```
financy/
├── app/
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/           # Página de login
│   │   ├── register/        # Página de cadastro
│   │   └── layout.tsx       # Layout de auth
│   ├── (home)/              # Rotas pós-login
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── transactions/    # Lista de transações
│   │   ├── categories/      # Gerenciamento de categorias
│   │   ├── profile/         # Perfil do usuário
│   │   └── layout.tsx       # Layout com header
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Redirect para dashboard
│   └── globals.css          # Estilos globais
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   ├── Header.tsx           # Header com navegação
│   ├── Logo.tsx             # Logo do Financy
│   ├── CategoryBadge.tsx    # Badge de categoria
│   ├── CategoryModal.tsx    # Modal de nova categoria
│   ├── TransactionModal.tsx # Modal de nova transação
│   └── index.ts             # Exports centralizados
├── lib/
│   ├── data.ts              # Dados mock e tipos
│   └── utils.ts             # Utilitários (cn function)
└── public/
    └── assets/
        └── Logo.svg         # Logo oficial
```

## 📄 Páginas

### Autenticação
- **Login** (`/login`) - Página de autenticação
- **Cadastro** (`/register`) - Página de registro

### Principal
- **Dashboard** (`/dashboard`) - Visão geral financeira
- **Transações** (`/transactions`) - Lista e filtros de transações
- **Categorias** (`/categories`) - Gerenciamento de categorias
- **Perfil** (`/profile`) - Configurações do usuário

## 🎨 Style Guide

### Cores da Marca
- **Brand Base**: `#1F6F43`
- **Brand Dark**: `#124B2B`

### Cores de Categoria
- Green, Blue, Purple, Pink, Red, Orange, Yellow

### Feedback
- **Danger**: `#EF4444`
- **Success**: `#19AD70`

## 📋 Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run lint` - Executa ESLint

---

**Desenvolvido com ❤️ usando Next.js + shadcn/ui**
