"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  ClipboardList,
  Info,
  Trash2,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notificacao {
  id: number
  titulo: string
  mensagem: string
  tipo: "convocatoria" | "treino" | "geral" | "alerta"
  data: string
  lida: boolean
}

const mockNotificacoes: Notificacao[] = [
  { id: 1, titulo: "Nova Convocatoria", mensagem: "Foste convocado para o jogo de Sabado contra FC Exemplo.", tipo: "convocatoria", data: "2025-01-24T10:30:00", lida: false },
  { id: 2, titulo: "Treino Cancelado", mensagem: "O treino de quinta-feira foi cancelado devido as condicoes meteorologicas.", tipo: "alerta", data: "2025-01-23T16:00:00", lida: false },
  { id: 3, titulo: "Lembrete de Treino", mensagem: "Treino amanha as 18:30 no Campo Principal. Nao te esqueças do equipamento.", tipo: "treino", data: "2025-01-22T18:00:00", lida: true },
  { id: 4, titulo: "Atualizacao do Calendario", mensagem: "O jogo de dia 15 foi adiado para dia 22 de Fevereiro.", tipo: "geral", data: "2025-01-20T09:00:00", lida: true },
  { id: 5, titulo: "Convocatoria Torneio", mensagem: "Foste selecionado para participar no Torneio de Inverno.", tipo: "convocatoria", data: "2025-01-18T14:00:00", lida: true },
]

export default function NotificacoesAtletaPage() {
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "atleta") {
      router.push("/")
    }
  }, [router])

  const naoLidas = mockNotificacoes.filter((n) => !n.lida)

  const getIcone = (tipo: Notificacao["tipo"]) => {
    switch (tipo) {
      case "convocatoria":
        return <ClipboardList className="size-5 text-primary" />
      case "treino":
        return <Calendar className="size-5 text-cap-navy" />
      case "alerta":
        return <AlertCircle className="size-5 text-cap-red" />
      case "geral":
        return <Info className="size-5 text-muted-foreground" />
    }
  }

  const formatarData = (data: string) => {
    const d = new Date(data)
    const agora = new Date()
    const diffMs = agora.getTime() - d.getTime()
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHoras < 1) return "Agora mesmo"
    if (diffHoras < 24) return `Ha ${diffHoras}h`
    if (diffDias < 7) return `Ha ${diffDias} dia${diffDias > 1 ? "s" : ""}`
    return d.toLocaleDateString("pt-PT")
  }

  return (
    <DashboardLayout role="atleta" userName="Joao Silva">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificacoes</h1>
            <p className="text-muted-foreground">Mantem-te atualizado com as novidades do clube</p>
          </div>
          {naoLidas.length > 0 && (
            <Button variant="outline">
              <CheckCircle className="size-4 mr-2" />
              Marcar Todas como Lidas
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Por Ler
              </CardTitle>
              <Bell className="size-4 text-cap-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-red">{naoLidas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
              <Bell className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockNotificacoes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Convocatorias
              </CardTitle>
              <ClipboardList className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockNotificacoes.filter((n) => n.tipo === "convocatoria").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Notificacoes</CardTitle>
            <CardDescription>{mockNotificacoes.length} notificacoes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockNotificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    notificacao.lida
                      ? "bg-secondary/30"
                      : "bg-cap-gold/5 border-cap-gold/20"
                  }`}
                >
                  <div className="size-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    {getIcone(notificacao.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {notificacao.titulo}
                          {!notificacao.lida && (
                            <span className="size-2 rounded-full bg-cap-red" />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notificacao.mensagem}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatarData(notificacao.data)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {!notificacao.lida && (
                        <Button variant="outline" size="sm">
                          <CheckCircle className="size-3 mr-1" />
                          Marcar como Lida
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Trash2 className="size-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
