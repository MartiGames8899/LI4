"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  CreditCard,
  FileText,
  Heart,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  UserPlus,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface User {
  email: string
  role: string
}

// Mocks removed

export default function DashboardSecretariaPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [quotasAtraso, setQuotasAtraso] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  
  const [stats, setStats] = useState({
    totalSocios: 0,
    sociosAtivos: 0,
    novosSociosMes: 0,
    totalAtletas: 0,
    quotasEmAtraso: 0,
    valorEmAtraso: 0,
    atestadosExpirados: 0
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "secretaria") {
      router.push("/")
      return
    }
    setUser(parsed)

    const loadDashboardData = async () => {
      try {
        const { fetchApi } = await import('@/lib/api')
        const [socios, quotas, atestados, atletas, pagamentos] = await Promise.all([
          fetchApi<any[]>('/api/users/socios').catch(() => []),
          fetchApi<any[]>('/api/finance/quotas/atraso').catch(() => []),
          fetchApi<any[]>('/api/clinical/certificates').catch(() => []),
          fetchApi<any[]>('/api/users/athletes').catch(() => []),
          fetchApi<any[]>('/api/finance/payments').catch(() => []) // from Phase 2
        ])
        
        setStats({
          totalSocios: socios.length,
          sociosAtivos: socios.filter(s => s.estado === 'Ativo').length,
          novosSociosMes: socios.filter(s => new Date(s.dataInscricao).getMonth() === new Date().getMonth()).length,
          totalAtletas: atletas.length,
          quotasEmAtraso: quotas.length,
          valorEmAtraso: quotas.reduce((sum, q) => sum + (q.valorTotal || 0), 0),
          atestadosExpirados: atestados.filter(a => new Date(a.dataExpiracao) < new Date()).length
        })

        // Map quotasAtraso list
        const atrasoMapped = quotas.slice(0, 5).map(q => ({
            id: q.id,
            nome: q.socio?.nome || "Socio",
            meses: 1, // simplified
            valor: q.valorTotal,
            notificado: false
        }))
        setQuotasAtraso(atrasoMapped)

        // Map recentActivity from payments
        const recentPayments = pagamentos
            .sort((a,b) => new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime())
            .slice(0, 5)
            .map((p, i) => ({
                id: i,
                tipo: "pagamento",
                descricao: `Pagamento recebido - ReferÃªncia ${p.referencia || ''}`,
                valor: p.valor,
                data: new Date(p.dataPagamento).toLocaleString("pt-PT")
            }))
        setRecentActivity(recentPayments)
      } catch (err) {
        console.error("Erro ao carregar dashboard", err)
      }
    }
    loadDashboardData()
  }, [router])

  if (!user) {
    return null
  }

  const handleNotificarSocio = (id: number) => {
    setQuotasAtraso(prev => prev.map(s => s.id === id ? { ...s, notificado: true } : s))
  }

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard da Secretaria</h1>
            <p className="text-muted-foreground">Gestao administrativa do CAP - Clube Amigos de Polvoreira</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/secretaria/socios")}>
              <UserPlus className="size-4 mr-2" />
              Novo Socio
            </Button>
            <Button onClick={() => router.push("/dashboard/secretaria/quotas")}>
              <CreditCard className="size-4 mr-2" />
              Gerir Quotas
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Socios
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSocios}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <TrendingUp className="size-3 mr-1" />
                +{stats.novosSociosMes} este mes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atletas Registados
              </CardTitle>
              <Users className="size-4 text-cap-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAtletas}</div>
              <p className="text-xs text-muted-foreground">Em todas as equipas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quotas em Atraso
              </CardTitle>
              <CreditCard className="size-4 text-cap-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-red">{stats.quotasEmAtraso}</div>
              <div className="flex items-center text-xs text-cap-red mt-1">
                <Euro className="size-3 mr-1" />
                {stats.valorEmAtraso}EUR em divida
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atestados Expirados
              </CardTitle>
              <Heart className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{stats.atestadosExpirados}</div>
              <p className="text-xs text-muted-foreground">Necessitam renovacao</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(stats.quotasEmAtraso > 10 || stats.atestadosExpirados > 5) && (
          <div className="grid gap-3 md:grid-cols-2">
            {stats.quotasEmAtraso > 10 && (
              <Card className="border-cap-red/50 bg-cap-red/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="size-5 text-cap-red mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-cap-red">Quotas em Atraso Elevadas</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stats.quotasEmAtraso} socios com quotas em atraso. Considere enviar lembretes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.atestadosExpirados > 5 && (
              <Card className="border-cap-gold/50 bg-cap-gold/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 text-cap-gold mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-cap-gold">Atestados a Renovar</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stats.atestadosExpirados} atletas com atestados expirados ou a expirar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>Ultimas acoes no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      activity.tipo === "pagamento" ? "bg-success/10" :
                      activity.tipo === "inscricao" ? "bg-cap-navy/10" :
                      activity.tipo === "atestado" ? "bg-cap-gold/10" :
                      "bg-secondary"
                    }`}>
                      {activity.tipo === "pagamento" && <CreditCard className="size-5 text-success" />}
                      {activity.tipo === "inscricao" && <UserPlus className="size-5 text-cap-navy" />}
                      {activity.tipo === "atestado" && <FileText className="size-5 text-cap-gold" />}
                      {activity.tipo === "reserva" && <Building2 className="size-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.descricao}</p>
                      <p className="text-xs text-muted-foreground">{activity.data}</p>
                    </div>
                    {activity.valor && (
                      <Badge className="bg-success/10 text-success border-success/20">
                        +{activity.valor}EUR
                      </Badge>
                    )}
                  </div>
                )) : (
                    <p className="text-sm text-muted-foreground">Sem atividade recente.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quotas em Atraso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Quotas em Atraso
              </CardTitle>
              <CardDescription>Socios com pagamentos pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotasAtraso.map((socio) => (
                  <div key={socio.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {socio.nome.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{socio.nome}</p>
                        <p className="text-xs text-cap-red">{socio.meses} meses em atraso</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cap-red">{socio.valor}EUR</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-1 h-7 text-xs"
                        onClick={() => handleNotificarSocio(socio.id)}
                        disabled={socio.notificado}
                      >
                        {socio.notificado ? "Notificado" : "Notificar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/secretaria/quotas")}>
                Ver Todas as Quotas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/secretaria/socios")}>
                <Users className="size-5" />
                <span>Gerir Socios</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/secretaria/quotas")}>
                <CreditCard className="size-5" />
                <span>Quotas e Pagamentos</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/secretaria/atestados")}>
                <Heart className="size-5" />
                <span>Atestados</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/secretaria/instalacoes")}>
                <Building2 className="size-5" />
                <span>Instalacoes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
