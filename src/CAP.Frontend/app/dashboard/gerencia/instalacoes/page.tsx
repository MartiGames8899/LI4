"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Calendar, Clock, Plus, CheckCircle, AlertTriangle } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { fetchApi } from "@/lib/api"

interface Instalacao {
  id: string
  nome: string
  tipo: string
  capacidade: number
  estado: number
}

interface Reserva {
  id: string
  espacoId: string
  titulo: string
  dataInicio: string
  dataFim: string
}

export default function GerenciaInstalacoesPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [instalacoes, setInstalacoes] = useState<Instalacao[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [novaReservaOpen, setNovaReservaOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [novaReserva, setNovaReserva] = useState({
    espacoId: "",
    titulo: "",
    data: "",
    horaInicio: "",
    horaFim: "",
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 1)
      const [spaces, calendar] = await Promise.all([
        fetchApi<Instalacao[]>("/api/facilities/spaces").catch(() => [] as Instalacao[]),
        fetchApi<Reserva[]>(`/api/facilities/calendar?start=${now.toISOString()}&end=${end.toISOString()}`).catch(() => [] as Reserva[]),
      ])
      setInstalacoes(spaces)
      setReservas(calendar)
    } catch (e) {
      console.error("Erro ao carregar instalações", e)
    } finally {
      setLoading(false)
    }
  }

  const handleNovaReserva = async () => {
    if (!novaReserva.espacoId || !novaReserva.titulo || !novaReserva.data) return
    setIsSaving(true)
    try {
      const dataInicio = new Date(`${novaReserva.data}T${novaReserva.horaInicio || "09:00"}`)
      const dataFim = new Date(`${novaReserva.data}T${novaReserva.horaFim || "10:00"}`)
      await fetchApi("/api/facilities/reservations", {
        method: "POST",
        body: JSON.stringify({
          espacoId: novaReserva.espacoId,
          titulo: novaReserva.titulo,
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim.toISOString(),
          isManutencao: false,
        }),
      })
      setNovaReservaOpen(false)
      setNovaReserva({ espacoId: "", titulo: "", data: "", horaInicio: "", horaFim: "" })
      loadData()
    } catch (e) {
      alert("Erro ao criar reserva (possível conflito de horário)")
    } finally {
      setIsSaving(false)
    }
  }

  const disponiveis = instalacoes.filter(i => i.estado === 0).length
  const emManutencao = instalacoes.filter(i => i.estado !== 0).length

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-6 text-primary" />
              Instalações
            </h1>
            <p className="text-muted-foreground">Gestão de espaços e reservas do clube.</p>
          </div>
          <Dialog open={novaReservaOpen} onOpenChange={setNovaReservaOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="size-4 mr-2" />
                Nova Reserva
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Reserva</DialogTitle>
                <DialogDescription>Reserve um espaço para uma atividade.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Espaço</Label>
                  <Select value={novaReserva.espacoId} onValueChange={v => setNovaReserva(f => ({ ...f, espacoId: v || "" }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um espaço" />
                    </SelectTrigger>
                    <SelectContent>
                      {instalacoes.filter(i => i.estado === 0).map(i => (
                        <SelectItem key={i.id} value={i.id} label={i.nome}>{i.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={novaReserva.titulo} onChange={e => setNovaReserva(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Reunião de Direção" />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={novaReserva.data} onChange={e => setNovaReserva(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hora Início</Label>
                    <Input type="time" value={novaReserva.horaInicio} onChange={e => setNovaReserva(f => ({ ...f, horaInicio: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Fim</Label>
                    <Input type="time" value={novaReserva.horaFim} onChange={e => setNovaReserva(f => ({ ...f, horaFim: e.target.value }))} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNovaReservaOpen(false)}>Cancelar</Button>
                <Button onClick={handleNovaReserva} disabled={isSaving || !novaReserva.espacoId || !novaReserva.titulo || !novaReserva.data}>
                  {isSaving ? "A guardar..." : "Criar Reserva"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Espaços</CardTitle>
              <Building2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{instalacoes.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disponíveis</CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-success">{disponiveis}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Manutenção</CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{emManutencao}</div></CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4" />
                Espaços
              </CardTitle>
              <CardDescription>{instalacoes.length} espaços registados</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-4">A carregar...</p>
              ) : instalacoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum espaço registado.</p>
              ) : (
                <div className="space-y-3">
                  {instalacoes.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{i.nome}</p>
                        <p className="text-xs text-muted-foreground">{i.tipo} · Cap. {i.capacidade}</p>
                      </div>
                      <Badge variant={i.estado === 0 ? "secondary" : "destructive"}>
                        {i.estado === 0 ? "Disponível" : "Manutenção"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-4" />
                Próximas Reservas
              </CardTitle>
              <CardDescription>{reservas.length} reservas nos próximos 2 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-4">A carregar...</p>
              ) : reservas.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhuma reserva programada.</p>
              ) : (
                <div className="space-y-3">
                  {reservas.slice(0, 8).map(r => (
                    <div key={r.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <Clock className="size-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{r.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.dataInicio).toLocaleDateString("pt-PT")} · {new Date(r.dataInicio).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}–{new Date(r.dataFim).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
