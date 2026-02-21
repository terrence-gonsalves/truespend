export interface Transaction {
    id: string
    date: string
    description: string
    amount: number
    category_id: string | null
    account_id: string | null
    is_income: boolean | null
    hash: string
    created_at: string | null
    updated_at: string | null
    category?: {
        id: string
        name: string
        color: string | null
    } | null
    account?: {
        id: string
        name: string
        institution: string | null
    } | null
  };
  
  export interface Category {
    id: string
    name: string
    color: string | null
    is_system?: boolean | null
    user_id?: string | null
    archived?: boolean | null
    created_at?: string | null
  };
  
  export interface Account {
    id: string
    name: string
    institution: string | null
    user_id?: string | null
    created_at?: string | null
  };