"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ClipboardList,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Convocatoria {
  id: number
  titulo: string
  tipo: "treino" | "jogo" | "evento"
  data: string
  hora: string
  local: string
  adversario?: string
  estado: "pendente" | "confirmado" | "recusado"
}

const mockConvocatorias: Convocatoria[] = [
  { id: 1, titulo: "Jogo vs FC Exemplo", tipo: "jogo", data: "2025-01-25", hora: "15:00", local: "Campo Visitante", adversario: "FC Exemplo", estado: "pendente" },
  { id: 2, titulo: "Treino", tipo: "treino", data: "2025-01-27", hora: "18:30", local: "Campo Principal", estado: "confirmado" },
  { id: 3, titulo: "Treino Especial", tipo: "treino", data: "2025-01-26", hora: "10:00", local: "Campo Principal", estado: "confirmado" },
  { id: 4, titulo: "Jogo vs SC Braga B", tipo: "jogo", data: "2025-02-01", hora: "10:00", local: "Campo Casa", adversario: "SC Braga B", estado: "pendente" },
]

export default function ConvocatoriasAtletaPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pendentes")

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

  const pendentes = mockConvocatorias.filter((c) => c.estado === "pendente")
  const confirmadas = mockConvocatorias.filter((c) => c.estado === "confirmado")

  const getTipoBadge = (tipo: Convocatoria["tipo"]) => {
    switch (tipo) {
      case "jogo":
        return <Badge className="bg-cap-red/10 text-cap-red border-cap-red/20">Jogo</Badge>
      case "treino":
        return <Badge className="bg-cap-navy/10 text-cap-navy border-cap-navy/20">Treino</Badge>
      case "evento":
        return <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">Evento</Badge>
    }
  }

  return (
    <DashboardLayout role="atleta" userName="Joao Silva">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Convocatorias</h1>
          <p className="text-muted-foreground">Responde as convocatorias para treinos e jogos</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
              <AlertCircle className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{pendentes.length}</div>
              <p className="text-xs text-muted-foreground">A aguardar resposta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmadas
              </CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{confirmadas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
              <ClipboardList className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockConvocatorias.length}</div>
            </CardContent>
          </Card>
        </div>

        {pendentes.length > 0 && (
          <Card className="border-cap-gold/50 bg-cap-gold/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cap-gold">
                <AlertCircle className="size-5" />
                Convocatorias Pendentes
              </CardTitle>
              <CardDescription>Responde a estas convocatorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendentes.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 rounded-lg bg-background border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      {getTipoBadge(conv.tipo)}
                      <Badge variant="outline">Pendente</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{conv.titulo}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {new Date(conv.data).toLocaleDateString("pt-PT")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" />
                        {conv.hora}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {conv.local}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-success hover:bg-success/90">
                        <CheckCircle className="size-4 mr-2" />
                        Confirmar
                      </Button>
                      <Button variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                        <XCircle className="size-4 mr-2" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Historico de Convocatorias</CardTitle>
            <CardDescription>Todas as tuas convocatorias</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
              <TabsList>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
                <TabsTrigger value="confirmadas">Confirmadas</TabsTrigger>
                <TabsTrigger value="todas">Todas</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-3">
                  {(activeTab === "pendentes"
                    ? pendentes
                    : activeTab === "confirmadas"
                    ? confirmadas
                    : mockConvocatorias
                  ).map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`size-3 rounded-full ${
                          conv.tipo === "jogo" ? "bg-cap-red" :
                          conv.tipo === "treino" ? "bg-cap-navy" : "bg-cap-gold"
                        }`} />
                        <div>
                          <p className="font-medium">{conv.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(conv.data).toLocaleDateString("pt-PT")} - {conv.hora}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={conv.estado === "confirmado" ? "secondary" : "outline"}
                        className={conv.estado === "confirmado" ? "bg-success/10 text-success" : ""}
                      >
                        {conv.estado === "confirmado" && <CheckCircle className="size-3 mr-1" />}
                        {conv.estado === "pendente" && <Clock className="size-3 mr-1" />}
                        {conv.estado.charAt(0).toUpperCase() + conv.estado.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
