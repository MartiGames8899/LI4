"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  CalendarDays,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
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

// Mock data - replace with API calls
const mockStats = {
  totalAtletas: 24,
  presencaMedia: 87,
  proximoTreino: "Hoje, 18:30",
  convocatoriasPendentes: 3,
}

const mockProximosEventos = [
  { id: 1, tipo: "Treino", data: "Hoje, 18:30", local: "Campo Principal" },
  { id: 2, tipo: "Jogo", data: "Sabado, 15:00", local: "Campo Visitante", adversario: "FC Exemplo" },
  { id: 3, tipo: "Treino", data: "Segunda, 18:30", local: "Campo Principal" },
]

const mockAtletasDestaque = [
  { id: 1, nome: "Joao Silva", presenca: 95, posicao: "Avancado" },
  { id: 2, nome: "Pedro Santos", presenca: 92, posicao: "Medio" },
  { id: 3, nome: "Miguel Costa", presenca: 90, posicao: "Defesa" },
]

const mockConvocatoriasPendentes = [
  { id: 1, evento: "Jogo vs FC Exemplo", data: "Sabado, 15:00", respostas: "18/24" },
  { id: 2, evento: "Treino Especial", data: "Domingo, 10:00", respostas: "12/24" },
]

export default function DashboardTreinadorPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "treinador") {
      router.push("/")
      return
    }
    setUser(parsed)
  }, [router])

  if (!user) {
    return null
  }

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard do Treinador</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui esta o resumo da sua equipa.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Atletas
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalAtletas}</div>
              <p className="text-xs text-muted-foreground">Atletas ativos no plantel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Presenca Media
              </CardTitle>
              <TrendingUp className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{mockStats.presencaMedia}%</div>
              <p className="text-xs text-muted-foreground">Nos ultimos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proximo Treino
              </CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.proximoTreino}</div>
              <p className="text-xs text-muted-foreground">Campo Principal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Convocatorias
              </CardTitle>
              <ClipboardList className="size-4 text-cap-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-red">{mockStats.convocatoriasPendentes}</div>
              <p className="text-xs text-muted-foreground">Pendentes de resposta</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Proximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-5" />
                Proximos Eventos
              </CardTitle>
              <CardDescription>Treinos e jogos agendados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProximosEventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-2 rounded-full ${
                          evento.tipo === "Jogo" ? "bg-cap-red" : "bg-cap-navy"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {evento.tipo}
                          {evento.adversario && ` vs ${evento.adversario}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{evento.local}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{evento.data}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/treinador/calendario")}>
                Ver Calendario Completo
              </Button>
            </CardContent>
          </Card>

          {/* Convocatorias Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" />
                Convocatorias Pendentes
              </CardTitle>
              <CardDescription>A aguardar resposta dos atletas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockConvocatoriasPendentes.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-sm">{conv.evento}</p>
                      <p className="text-xs text-muted-foreground">{conv.data}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {conv.respostas}
                      </Badge>
                      <p className="text-xs text-muted-foreground">respostas</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" onClick={() => router.push("/dashboard/treinador/convocatorias")}>
                Gerir Convocatorias
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Atletas Destaque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-success" />
              Atletas em Destaque
            </CardTitle>
            <CardDescription>Melhor taxa de presenca este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {mockAtletasDestaque.map((atleta, index) => (
                <div
                  key={atleta.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                >
                  <div className="relative">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {atleta.nome.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <span className="absolute -top-1 -right-1 size-5 bg-cap-gold rounded-full flex items-center justify-center text-xs font-bold text-white">
                        1
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{atleta.nome}</p>
                    <p className="text-xs text-muted-foreground">{atleta.posicao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cap-gold">{atleta.presenca}%</p>
                    <p className="text-xs text-muted-foreground">presenca</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/treinador/plantel")}>
              Ver Todo o Plantel
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/treinador/convocatorias/nova")}>
                <ClipboardList className="size-5" />
                <span>Nova Convocatoria</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/treinador/presencas")}>
                <CheckCircle className="size-5" />
                <span>Registar Presencas</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/treinador/atestados")}>
                <AlertCircle className="size-5" />
                <span>Ver Atestados</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/treinador/plantel")}>
                <Users className="size-5" />
                <span>Gerir Plantel</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
