"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"

interface Evento {
  id: number
  titulo: string
  tipo: "treino" | "jogo" | "evento"
  data: string
  hora: string
  local: string
  adversario?: string
  convocado: boolean
}

const mockEventos: Evento[] = [
  { id: 1, titulo: "Treino", tipo: "treino", data: "2025-01-27", hora: "18:30", local: "Campo Principal", convocado: true },
  { id: 2, titulo: "Jogo vs FC Exemplo", tipo: "jogo", data: "2025-01-25", hora: "15:00", local: "Campo Visitante", adversario: "FC Exemplo", convocado: true },
  { id: 3, titulo: "Treino", tipo: "treino", data: "2025-01-29", hora: "18:30", local: "Campo Principal", convocado: true },
  { id: 4, titulo: "Treino", tipo: "treino", data: "2025-01-31", hora: "18:30", local: "Campo Principal", convocado: true },
  { id: 5, titulo: "Jogo vs SC Braga B", tipo: "jogo", data: "2025-02-01", hora: "10:00", local: "Campo Casa", adversario: "SC Braga B", convocado: true },
]

export default function CalendarioAtletaPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

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

  const eventosSelecionados = selectedDate
    ? mockEventos.filter(
        (evento) => evento.data === selectedDate.toISOString().split("T")[0]
      )
    : []

  const getTipoBadge = (tipo: Evento["tipo"]) => {
    switch (tipo) {
      case "jogo":
        return <Badge className="bg-cap-red/10 text-cap-red border-cap-red/20">Jogo</Badge>
      case "treino":
        return <Badge className="bg-cap-navy/10 text-cap-navy border-cap-navy/20">Treino</Badge>
      case "evento":
        return <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">Evento</Badge>
    }
  }

  const diasComEventos = mockEventos.map((e) => new Date(e.data))

  return (
    <DashboardLayout role="atleta" userName="Joao Silva">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">O Meu Calendario</h1>
          <p className="text-muted-foreground">Visualiza os treinos e jogos agendados</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="size-5" />
                Selecionar Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                modifiers={{
                  evento: diasComEventos,
                }}
                modifiersStyles={{
                  evento: {
                    fontWeight: "bold",
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                    borderRadius: "50%",
                  },
                }}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Eventos em {selectedDate.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                  </CardTitle>
                  <CardDescription>
                    {eventosSelecionados.length} evento(s) agendado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eventosSelecionados.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Nenhum evento agendado para esta data</p>
                  ) : (
                    <div className="space-y-4">
                      {eventosSelecionados.map((evento) => (
                        <div
                          key={evento.id}
                          className="flex items-start justify-between p-4 rounded-lg bg-secondary/30"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getTipoBadge(evento.tipo)}
                              <span className="font-medium">{evento.titulo}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="size-4" />
                                {evento.hora}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="size-4" />
                                {evento.local}
                              </span>
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
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Proximos Eventos</CardTitle>
                <CardDescription>A tua agenda para os proximos dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEventos
                    .filter((e) => new Date(e.data) >= new Date())
                    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                    .slice(0, 5)
                    .map((evento) => (
                      <div
                        key={evento.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`size-3 rounded-full ${
                            evento.tipo === "jogo" ? "bg-cap-red" :
                            evento.tipo === "treino" ? "bg-cap-navy" : "bg-cap-gold"
                          }`} />
                          <div>
                            <p className="font-medium">{evento.titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(evento.data).toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" })} - {evento.hora}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{evento.local}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
