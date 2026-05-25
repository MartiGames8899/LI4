"use client"

import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Users,
  Calendar,
  FileText,
  CreditCard,
  Home,
  ClipboardList,
  UserCheck,
  Settings,
  LogOut,
  ShoppingBag,
  Bell,
  Building2,
  BarChart3,
  Heart,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigationByRole: Record<string, NavGroup[]> = {
  treinador: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", href: "/dashboard/treinador", icon: Home },
        { title: "Plantel", href: "/dashboard/treinador/plantel", icon: Users },
        { title: "Convocatorias", href: "/dashboard/treinador/convocatorias", icon: ClipboardList },
        { title: "Presencas", href: "/dashboard/treinador/presencas", icon: UserCheck },
        { title: "Calendario", href: "/dashboard/treinador/calendario", icon: Calendar },
      ],
    },
    {
      label: "Gestao",
      items: [
        { title: "Atestados", href: "/dashboard/treinador/atestados", icon: FileText },
        { title: "Relatorios", href: "/dashboard/treinador/relatorios", icon: BarChart3 },
      ],
    },
  ],
  encarregado: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", href: "/dashboard/encarregado", icon: Home },
        { title: "Meus Atletas", href: "/dashboard/encarregado/atletas", icon: Users },
        { title: "Convocatorias", href: "/dashboard/encarregado/convocatorias", icon: ClipboardList },
        { title: "Calendario", href: "/dashboard/encarregado/calendario", icon: Calendar },
      ],
    },
    {
      label: "Financeiro",
      items: [
        { title: "Pagamentos", href: "/dashboard/encarregado/pagamentos", icon: CreditCard },
        { title: "Quotas", href: "/dashboard/encarregado/quotas", icon: FileText },
      ],
    },
    {
      label: "Saude",
      items: [
        { title: "Atestados", href: "/dashboard/encarregado/atestados", icon: Heart },
      ],
    },
  ],
  secretaria: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", href: "/dashboard/secretaria", icon: Home },
        { title: "Socios", href: "/dashboard/secretaria/socios", icon: Users },
        { title: "Atletas", href: "/dashboard/secretaria/atletas", icon: UserCheck },
      ],
    },
    {
      label: "Financeiro",
      items: [
        { title: "Quotas", href: "/dashboard/secretaria/quotas", icon: CreditCard },
        { title: "Pagamentos", href: "/dashboard/secretaria/pagamentos", icon: FileText },
      ],
    },
    {
      label: "Gestao",
      items: [
        { title: "Atestados", href: "/dashboard/secretaria/atestados", icon: Heart },
        { title: "Instalacoes", href: "/dashboard/secretaria/instalacoes", icon: Building2 },
        { title: "Relatorios", href: "/dashboard/secretaria/relatorios", icon: BarChart3 },
      ],
    },
  ],
  atleta: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", href: "/dashboard/atleta", icon: Home },
        { title: "Convocatorias", href: "/dashboard/atleta/convocatorias", icon: ClipboardList },
        { title: "Calendario", href: "/dashboard/atleta/calendario", icon: Calendar },
      ],
    },
    {
      label: "Extras",
      items: [
        { title: "Loja", href: "/dashboard/atleta/loja", icon: ShoppingBag },
        { title: "Notificacoes", href: "/dashboard/atleta/notificacoes", icon: Bell },
      ],
    },
  ],
  gerencia: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", href: "/dashboard/gerencia", icon: Home },
        { title: "Socios", href: "/dashboard/gerencia/socios", icon: Users },
        { title: "Equipas", href: "/dashboard/gerencia/equipas", icon: UserCheck },
      ],
    },
    {
      label: "Financeiro",
      items: [
        { title: "Financas", href: "/dashboard/gerencia/financas", icon: CreditCard },
        { title: "Relatorios", href: "/dashboard/gerencia/relatorios", icon: BarChart3 },
      ],
    },
    {
      label: "Configuracoes",
      items: [
        { title: "Instalacoes", href: "/dashboard/gerencia/instalacoes", icon: Building2 },
        { title: "Definicoes", href: "/dashboard/gerencia/definicoes", icon: Settings },
      ],
    },
  ],
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role: string
  userName?: string
}

export function DashboardLayout({ children, role, userName = "Utilizador" }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navigation = navigationByRole[role] || []

  const handleLogout = () => {
    localStorage.removeItem("cap_user")
    router.push("/")
  }

  const roleLabels: Record<string, string> = {
    treinador: "Treinador",
    encarregado: "Encarregado de Educacao",
    secretaria: "Secretaria",
    atleta: "Atleta",
    gerencia: "Gerencia",
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href={`/dashboard/${role}`} className="flex items-center gap-3">
            <Image
              src="/images/logo-cap.png"
              alt="CAP"
              width={48}
              height={48}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-primary text-lg leading-tight">CAP</span>
              <span className="text-xs text-muted-foreground leading-tight">Clube Amigos de Polvoreira</span>
            </div>
          </Link>
        </SidebarHeader>

        <Separator />

        <SidebarContent className="px-2">
          {navigation.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href} className="flex items-center gap-3">
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">{userName}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {roleLabels[role]}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <Settings className="size-4 mr-2" />
                Definicoes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="size-4 mr-2" />
                Terminar Sessao
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
          <Bell className="size-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
