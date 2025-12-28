import {
  Wallet,
  Utensils,
  Car,
  ShoppingCart,
  TrendingUp,
  Gamepad2,
  Heart,
  Home,
  CreditCard,
  Briefcase,
  Gift,
  Music,
  Book,
  Plane,
  Coffee,
  Smartphone,
  Shirt,
  Dumbbell,
  GraduationCap,
  Baby,
  Repeat,
  Calendar,
  type LucideIcon,
} from 'lucide-react'
import { IconName } from '@/lib/supabase'

// Map of icon names to Lucide components
const iconMap: Record<IconName, LucideIcon> = {
  Wallet,
  Utensils,
  Car,
  ShoppingCart,
  TrendingUp,
  Gamepad2,
  Heart,
  Home,
  CreditCard,
  Briefcase,
  Gift,
  Music,
  Book,
  Plane,
  Coffee,
  Smartphone,
  Shirt,
  Dumbbell,
  GraduationCap,
  Baby,
  Repeat,
  Calendar,
}

// Get icon component by name
export function getIconByName(name: IconName): LucideIcon {
  return iconMap[name] || Wallet
}

// Get all available icons
export function getAllIcons(): { name: IconName; icon: LucideIcon }[] {
  return Object.entries(iconMap).map(([name, icon]) => ({
    name: name as IconName,
    icon,
  }))
}

// Icon name labels in Portuguese
export const iconLabels: Record<IconName, string> = {
  Wallet: 'Carteira',
  Utensils: 'Alimentação',
  Car: 'Veículo',
  ShoppingCart: 'Compras',
  TrendingUp: 'Investimento',
  Gamepad2: 'Jogos',
  Heart: 'Saúde',
  Home: 'Casa',
  CreditCard: 'Cartão',
  Briefcase: 'Trabalho',
  Gift: 'Presentes',
  Music: 'Música',
  Book: 'Livros',
  Plane: 'Viagem',
  Coffee: 'Café',
  Smartphone: 'Telefone',
  Shirt: 'Roupas',
  Dumbbell: 'Academia',
  GraduationCap: 'Educação',
  Baby: 'Bebê',
  Repeat: 'Recorrente',
  Calendar: 'Calendário',
}
