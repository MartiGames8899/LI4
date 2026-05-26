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

import { fetchApi } from "@/lib/api"

interface User {
  email: string
  role: string
  nome?: string
}

interface Convocatoria {
  id: string
  titulo: string
  tipo: string
  data: string
  hora: string
  local: string
  estado: string
}

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  dataCriacao: string
  lida: boolean
}

const mockAtletaInfoFallback = {
  nome: "Atleta",
  numero: 0,
  equipa: "Sem equipa",
  posicao: "N/A",
  presencaMedia: 0,
  jogosEpoca: 0,
  golosEpoca: 0,
}

export default function DashboardAtletaPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [convocatoriasPendentes, setConvocatoriasPendentes] = useState<Convocatoria[]>([])
  const [eventos, setEventos] = useState<Convocatoria[]>([])
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [atletaInfo, setAtletaInfo] = useState(mockAtletaInfoFallback)

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

    const loadData = async () => {
      try {
        const convs = await fetchApi<Convocatoria[]>("api/sports/convocations/my")
        setEventos(convs)
        setConvocatoriasPendentes(convs.filter(c => c.estado === "pendente"))
      } catch (e) { console.error(e) }

      try {
        const notifs = await fetchApi<Notificacao[]>("api/notifications/inbox")
        setNotificacoes(notifs.filter(n => !n.lida).slice(0, 5))
      } catch (e) { console.error(e) }

      try {
        const profile = await fetchApi<any>("api/users/profile")
        if (profile) {
            setAtletaInfo({
                ...atletaInfo,
                nome: profile.nome || user?.nome || mockAtletaInfoFallback.nome,
                numero: profile.numero || 0,
                equipa: profile.equipa || "Sem equipa",
                posicao: profile.posicao || "N/A"
            })
        }
      } catch (e) { console.error(e) }
    }
    loadData()
  }, [router])

  if (!user) {
    return null
  }

  const handleConfirmarConvocatoria = async (id: string) => {
    try {
      await fetchApi(`api/sports/convocations/${id}/my-presence`, {
        method: "PATCH",
        body: JSON.stringify({ estado: "confirmado" })
      })
      setConvocatoriasPendentes(prev => prev.filter(c => c.id !== id))
    } catch(e) {}
  }

  const handleRecusarConvocatoria = async (id: string) => {
    try {
      await fetchApi(`api/sports/convocations/${id}/my-presence`, {
        method: "PATCH",
        body: JSON.stringify({ estado: "recusado" })
      })
      setConvocatoriasPendentes(prev => prev.filter(c => c.id !== id))
    } catch(e) {}
  }

  return (
    <DashboardLayout role="atleta" userName={user?.nome || atletaInfo.nome}>
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border-2 border-primary-foreground/20">
                  <AvatarFallback className="text-xl bg-primary-foreground/10 text-primary-foreground">
                    {atletaInfo.nome.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">Ola, {(user?.nome || atletaInfo.nome).split(" ")[0]}!</h1>
                  <p className="text-primary-foreground/80">
                    #{atletaInfo.numero} - {atletaInfo.posicao} | {atletaInfo.equipa}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold">{atletaInfo.presencaMedia}%</p>
                  <p className="text-xs text-primary-foreground/70">Presenca</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{atletaInfo.jogosEpoca}</p>
                  <p className="text-xs text-primary-foreground/70">Jogos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{atletaInfo.golosEpoca}</p>
                  <p className="text-xs text-primary-foreground/70">Golos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Convocatoria Pendente Alert */}
        {convocatoriasPendentes.length > 0 && (
          <Card className="border-cap-gold/50 bg-cap-gold/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ClipboardList className="size-5 text-cap-gold mt-0.5" />
                  <div>
                    <p className="font-medium text-cap-gold">Convocatoria Pendente</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {convocatoriasPendentes[0].titulo} - {convocatoriasPendentes[0].data}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleConfirmarConvocatoria(convocatoriasPendentes[0].id)}>
                    <CheckCircle className="size-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => handleRecusarConvocatoria(convocatoriasPendentes[0].id)}>
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
              <div className="text-lg font-bold">{eventos.length > 0 ? eventos[0].titulo : "Nenhum evento"}</div>
              <p className="text-xs text-muted-foreground">{eventos.length > 0 ? eventos[0].data : ""}</p>
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
              <div className="text-2xl font-bold text-cap-gold">{atletaInfo.presencaMedia}%</div>
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
              <div className="text-2xl font-bold">{atletaInfo.golosEpoca}</div>
              <p className="text-xs text-muted-foreground">Em {atletaInfo.jogosEpoca} jogos</p>
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
                {notificacoes.length}
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
                {eventos.slice(0, 3).map((evento) => (
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
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="size-3" />
                          {evento.data}
                          <MapPin className="size-3 ml-2" />
                          {evento.local}
                        </div>
                      </div>
                    </div>
                    {evento.estado === "confirmado" && (
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
                {notificacoes.map((notif) => (
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
                      <span className="text-xs text-muted-foreground">{new Date(notif.dataCriacao).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/notificacoes")}>
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
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/dashboard/notificacoes")}>
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
