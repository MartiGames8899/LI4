"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"

interface Evento {
  id: string
  titulo: string
  tipo: "treino" | "jogo" | "evento"
  data: string
  hora: string
  local: string
  adversario?: string
}

export default function CalendarioTreinadorPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "treinador") {
      router.push("/")
    } else {
      loadData()
    }
  }, [router])

  const loadData = async () => {
    try {
      const [treinosRes, convsRes] = await Promise.all([
        fetchApi<any>("/api/sports/trainings"),
        fetchApi<any>("/api/sports/convocations")
      ])

      const treinos = treinosRes.data || []
      const convs = convsRes.data || []

      const treinosEventos: Evento[] = treinos.map((t: any) => ({
        id: t.id,
        titulo: "Treino",
        tipo: "treino",
        data: t.dataInicio.split("T")[0],
        hora: t.dataInicio.split("T")[1].substring(0, 5),
        local: "EspaÃ§o " + t.espacoId
      }))

      const convsEventos: Evento[] = convs.map((c: any) => ({
        id: c.id,
        titulo: c.titulo,
        tipo: "jogo", // simplification
        data: c.data.split("T")[0],
        hora: c.hora,
        local: c.local
      }))

      setEventos([...treinosEventos, ...convsEventos])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const eventosDoMes = eventos.filter((evento) => {
    const eventoDate = new Date(evento.data)
    return (
      eventoDate.getMonth() === currentMonth.getMonth() &&
      eventoDate.getFullYear() === currentMonth.getFullYear()
    )
  })

  const eventosSelecionados = selectedDate
    ? eventos.filter(
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

  const diasComEventos = eventos.map((e) => new Date(e.data))

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground">Visualize treinos, jogos e eventos agendados</p>
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
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
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
                <CardDescription>Agenda dos proximos dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventos
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
