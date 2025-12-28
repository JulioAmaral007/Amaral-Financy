# Financy - Configuração do Supabase

Este guia explica como configurar o Supabase para o projeto Financy.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase

## 🚀 Configuração

### 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Escolha um nome e senha para o banco de dados
4. Selecione a região mais próxima

### 2. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em **Settings > API**
2. Copie a **Project URL** e a **anon public key**
3. Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Criar as Tabelas

1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase/schema.sql`
3. Cole no editor e clique em **Run**

Isso irá criar:
- **profiles** - Informações do perfil do usuário
- **categories** - Categorias de transações
- **transactions** - Transações financeiras

### 4. Habilitar Autenticação por Email

1. Vá em **Authentication > Settings > Auth Providers**
2. Habilite "Email" se ainda não estiver habilitado
3. (Opcional) Configure SMTP para emails de confirmação

## 📊 Estrutura do Banco de Dados

### Tabela: profiles
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID do usuário (referência auth.users) |
| full_name | text | Nome completo |
| avatar_url | text | URL do avatar |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

### Tabela: categories
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID da categoria |
| name | text | Nome da categoria |
| description | text | Descrição |
| icon | text | Nome do ícone (Lucide) |
| color | text | Cor (green, blue, purple, pink, red, orange, yellow) |
| user_id | uuid | ID do usuário proprietário |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

### Tabela: transactions
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID da transação |
| description | text | Descrição da transação |
| amount | decimal | Valor |
| type | text | Tipo (income ou expense) |
| date | date | Data da transação |
| category_id | uuid | ID da categoria |
| user_id | uuid | ID do usuário proprietário |
| recurring_transaction_id | uuid | ID da recorrência (se gerada automaticamente) |
| installment_number | integer | Número da parcela (se parcelamento) |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

### Tabela: recurring_transactions
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID da recorrência |
| description | text | Descrição da transação |
| amount | decimal | Valor |
| type | text | Tipo (income ou expense) |
| category_id | uuid | ID da categoria |
| user_id | uuid | ID do usuário proprietário |
| frequency | text | Frequência (daily, weekly, monthly, yearly) |
| day_of_month | integer | Dia do mês (1-31) para recorrência mensal |
| day_of_week | integer | Dia da semana (0-6) para recorrência semanal |
| start_date | date | Data de início |
| end_date | date | Data de término (opcional) |
| is_installment | boolean | Se é parcelamento |
| total_installments | integer | Número total de parcelas |
| current_installment | integer | Parcela atual |
| is_active | boolean | Se está ativa |
| last_generated_date | date | Última data que gerou transação |
| next_due_date | date | Próxima data de vencimento |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

## 🔐 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado, garantindo que:
- Usuários só podem ver seus próprios dados
- Usuários só podem modificar seus próprios dados
- Nenhum dado é compartilhado entre usuários

## 🎯 Funcionalidades Automáticas

### Triggers
- **on_auth_user_created**: Cria perfil automaticamente quando usuário se registra
- **on_auth_user_created_categories**: Cria categorias padrão para novo usuário
- **set_*_updated_at**: Atualiza automaticamente o campo updated_at

### Categorias Padrão
Quando um novo usuário se registra, as seguintes categorias são criadas:
- 🍽️ Alimentação
- 🎮 Entretenimento
- 📈 Investimento
- 🛒 Mercado
- 💰 Salário
- ❤️ Saúde
- 🚗 Transporte
- 🏠 Utilidades

## 🔧 Arquivos do Projeto

```
lib/supabase/
├── client.ts         # Cliente para uso no browser
├── server.ts         # Cliente para Server Components
├── types.ts          # Tipos do schema do banco
├── models.ts         # Tipos da aplicação e transformações
├── services.ts       # Funções de CRUD
├── auth-context.tsx  # Context de autenticação
└── index.ts          # Exports centralizados

proxy.ts              # Proteção de rotas (Next.js 16+)
supabase/
└── schema.sql        # Schema do banco de dados
```

## 📖 Uso

### Autenticação

```tsx
import { useAuth } from '@/lib/supabase'

function MyComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  
  if (loading) return <Loading />
  if (!user) return <LoginPrompt />
  
  return <Dashboard user={user} />
}
```

### Operações CRUD

```tsx
import { 
  getCategories, 
  createCategory,
  getTransactions,
  createTransaction 
} from '@/lib/supabase'

// Listar categorias
const categories = await getCategories()

// Criar categoria
const newCategory = await createCategory({
  name: 'Nova Categoria',
  icon: 'Wallet',
  color: 'blue',
})

// Listar transações
const transactions = await getTransactions({ limit: 10 })

// Criar transação
const newTransaction = await createTransaction({
  description: 'Compra',
  amount: 100.00,
  type: 'expense',
  date: '2025-01-01',
  category_id: categories[0].id,
})
```

## ❓ Solução de Problemas

### Erro: "User not authenticated"
- Verifique se o usuário está logado
- Verifique se o AuthProvider está envolvendo a aplicação

### Erro: "Row Level Security policy violation"
- Verifique se as políticas RLS estão corretas
- Verifique se o user_id está sendo enviado corretamente

### Erro: "Invalid API key"
- Verifique se as variáveis de ambiente estão configuradas
- Reinicie o servidor de desenvolvimento após alterar `.env.local`
