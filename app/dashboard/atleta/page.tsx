"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ClipboardList,
  ShoppingBag,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
  Trophy,
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

const mockAtletaInfo = {
  nome: "Joao Silva",
  numero: 10,
  equipa: "Sub-15",
  posicao: "Avancado",
  presencaMedia: 92,
  jogosEpoca: 12,
  golosEpoca: 8,
}

const mockProximosEventos = [
  { id: 1, tipo: "Jogo", data: "Sabado, 15:00", local: "Campo Visitante", adversario: "FC Exemplo", convocado: true },
  { id: 2, tipo: "Treino", data: "Segunda, 18:30", local: "Campo Principal", convocado: true },
  { id: 3, tipo: "Treino", data: "Quarta, 18:30", local: "Campo Principal", convocado: true },
]

const mockConvocatoriasPendentes = [
  { id: 1, evento: "Jogo vs FC Exemplo", data: "Sabado, 15:00", tipo: "jogo" },
]

const mockNotificacoes = [
  { id: 1, titulo: "Nova convocatoria", mensagem: "Foste convocado para o jogo de Sabado", tempo: "2h", lida: false },
  { id: 2, titulo: "Treino cancelado", mensagem: "O treino de quinta foi cancelado", tempo: "1d", lida: true },
]

export default function DashboardAtletaPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "atleta") {
      router.push("/")
      return
    }
    setUser(parsed)
  }, [router])

  if (!user) {
    return null
  }

  return (
    <DashboardLayout role="atleta" userName={mockAtletaInfo.nome}>
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border-2 border-primary-foreground/20">
                  <AvatarFallback className="text-xl bg-primary-foreground/10 text-primary-foreground">
                    {mockAtletaInfo.nome.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">Ola, {mockAtletaInfo.nome.split(" ")[0]}!</h1>
                  <p className="text-primary-foreground/80">
                    #{mockAtletaInfo.numero} - {mockAtletaInfo.posicao} | {mockAtletaInfo.equipa}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold">{mockAtletaInfo.presencaMedia}%</p>
                  <p className="text-xs text-primary-foreground/70">Presenca</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{mockAtletaInfo.jogosEpoca}</p>
                  <p className="text-xs text-primary-foreground/70">Jogos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{mockAtletaInfo.golosEpoca}</p>
                  <p className="text-xs text-primary-foreground/70">Golos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Convocatoria Pendente Alert */}
        {mockConvocatoriasPendentes.length > 0 && (
          <Card className="border-cap-gold/50 bg-cap-gold/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ClipboardList className="size-5 text-cap-gold mt-0.5" />
                  <div>
                    <p className="font-medium text-cap-gold">Convocatoria Pendente</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mockConvocatoriasPendentes[0].evento} - {mockConvocatoriasPendentes[0].data}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-success hover:bg-success/90">
                    <CheckCircle className="size-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30">
                    <XCircle className="size-4 mr-1" />
                    Recusar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proxima Atividade
              </CardTitle>
              <Calendar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{mockProximosEventos[0]?.tipo}</div>
              <p className="text-xs text-muted-foreground">{mockProximosEventos[0]?.data}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Presenca
              </CardTitle>
              <TrendingUp className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{mockAtletaInfo.presencaMedia}%</div>
              <p className="text-xs text-muted-foreground">Muito bom!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Golos na Epoca
              </CardTitle>
              <Trophy className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAtletaInfo.golosEpoca}</div>
              <p className="text-xs text-muted-foreground">Em {mockAtletaInfo.jogosEpoca} jogos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notificacoes
              </CardTitle>
              <Bell className="size-4 text-cap-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-red">
                {mockNotificacoes.filter((n) => !n.lida).length}
              </div>
              <p className="text-xs text-muted-foreground">Por ler</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Proximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Proximos Eventos
              </CardTitle>
              <CardDescription>A tua agenda para os proximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProximosEventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-3 rounded-full ${
                        evento.tipo === "Jogo" ? "bg-cap-red" : "bg-cap-navy"
                      }`} />
                      <div>
                        <p className="font-medium">
                          {evento.tipo}
                          {evento.adversario && ` vs ${evento.adversario}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="size-3" />
                          {evento.data}
                          <MapPin className="size-3 ml-2" />
                          {evento.local}
                        </div>
                      </div>
                    </div>
                    {evento.convocado && (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="size-3 mr-1" />
                        Convocado
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/atleta/calendario")}>
                Ver Calendario Completo
              </Button>
            </CardContent>
          </Card>

          {/* Notificacoes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-5" />
                Notificacoes
              </CardTitle>
              <CardDescription>Ultimas atualizacoes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNotificacoes.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg ${
                      notif.lida ? "bg-secondary/30" : "bg-cap-gold/5 border border-cap-gold/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          {notif.titulo}
                          {!notif.lida && (
                            <span className="size-2 rounded-full bg-cap-red" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.mensagem}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{notif.tempo}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/atleta/notificacoes")}>
                Ver Todas
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
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/atleta/convocatorias")}>
                <ClipboardList className="size-5" />
                <span>Convocatorias</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/atleta/calendario")}>
                <Calendar className="size-5" />
                <span>Calendario</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/atleta/loja")}>
                <ShoppingBag className="size-5" />
                <span>Loja CAP</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/atleta/notificacoes")}>
                <Bell className="size-5" />
                <span>Notificacoes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
