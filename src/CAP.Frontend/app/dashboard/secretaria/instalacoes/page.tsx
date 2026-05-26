"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Instalacao {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  estado: number; // 0 = Disponivel, 1 = EmManutencao
}

interface Reserva {
  id: string;
  espacoId: string;
  utilizadorId: string;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  estado: number;
}

import { fetchApi } from "@/lib/api"

export default function InstalacoesSecretariaPage() {
  const router = useRouter()
  const [novaReservaOpen, setNovaReservaOpen] = useState(false)

  const [instalacoes, setInstalacoes] = useState<Instalacao[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [novaReserva, setNovaReserva] = useState({
    espacoId: "",
    titulo: "",
    data: "",
    horaInicio: "",
    horaFim: "",
  })

  const loadData = async () => {
    try {
      const [spaces, calendar] = await Promise.all([
        fetchApi<Instalacao[]>('/api/facilities/spaces').catch(() => []),
        fetchApi<Reserva[]>('/api/facilities/calendar?start=2020-01-01&end=2030-01-01').catch(() => [])
      ])
      setInstalacoes(spaces)
      setReservas(calendar)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "secretaria") {
      router.push("/")
    } else {
      loadData()
    }
  }, [router])

  const handleCreateReservation = async () => {
    try {
      const start = new Date(`${novaReserva.data}T${novaReserva.horaInicio}`).toISOString()
      const end = new Date(`${novaReserva.data}T${novaReserva.horaFim}`).toISOString()
      
      await fetchApi('/api/facilities/reservations', {
        method: "POST",
        body: JSON.stringify({
          espacoId: novaReserva.espacoId,
          titulo: novaReserva.titulo,
          dataInicio: start,
          dataFim: end,
          isManutencao: false
        })
      })
      setNovaReservaOpen(false)
      loadData()
    } catch (e) {
      console.error(e)
      alert("Erro ao criar reserva (possÃ­vel conflito de horÃ¡rio)")
    }
  }

  const handleDeleteReserva = async (id: string) => {
    if (!confirm("Eliminar esta reserva?")) return
    try {
      await fetchApi(`/api/facilities/reservations/${id}`, { method: "DELETE" })
      setReservas(prev => prev.filter(r => r.id !== id))
    } catch {
      alert("Erro ao eliminar reserva")
    }
  }

  const disponiveis = instalacoes.filter((i) => i.estado === 0).length
  const reservasHoje = reservas.filter((r) => new Date(r.dataInicio).toDateString() === new Date().toDateString()).length

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestao de Instalacoes</h1>
            <p className="text-muted-foreground">Reservas e manutencao das instalacoes do clube</p>
          </div>
          <Dialog open={novaReservaOpen} onOpenChange={setNovaReservaOpen}>
            <DialogTrigger>
              <Button>
                <Plus className="size-4 mr-2" />
                Nova Reserva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Reserva</DialogTitle>
                <DialogDescription>Agende a utilizacao de uma instalacao</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Instalacao</Label>
                  <Select value={novaReserva.espacoId} onValueChange={(val) => setNovaReserva({ ...novaReserva, espacoId: val ?? "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a instalacao" />
                    </SelectTrigger>
                    <SelectContent>
                      {instalacoes
                        .map((i) => (
                          <SelectItem key={i.id} value={i.id.toString()}>
                            {i.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Equipa/Grupo (Titulo)</Label>
                  <Input placeholder="Ex: Sub-15, Direcao, etc." value={novaReserva.titulo} onChange={e => setNovaReserva({ ...novaReserva, titulo: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" value={novaReserva.data} onChange={e => setNovaReserva({ ...novaReserva, data: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Horas (Inicio - Fim)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="time" value={novaReserva.horaInicio} onChange={e => setNovaReserva({ ...novaReserva, horaInicio: e.target.value })} />
                      <span>-</span>
                      <Input type="time" value={novaReserva.horaFim} onChange={e => setNovaReserva({ ...novaReserva, horaFim: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNovaReservaOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateReservation} disabled={!novaReserva.espacoId || !novaReserva.data || !novaReserva.horaInicio || !novaReserva.horaFim}>
                  Confirmar Reserva
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Instalacoes
              </CardTitle>
              <Building2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instalacoes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponiveis
              </CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{disponiveis}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reservas Hoje
              </CardTitle>
              <Calendar className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{reservasHoje}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reservas
              </CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservas.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Instalacoes</CardTitle>
              <CardDescription>Estado atual das instalacoes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instalacoes.map((instalacao) => (
                  <div
                    key={instalacao.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{instalacao.nome}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="size-3" />
                          Capacidade: {instalacao.capacidade || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={instalacao.estado === 0 ? "secondary" : "outline"}
                        className={instalacao.estado === 0 ? "bg-success/10 text-success" : ""}
                      >
                        {instalacao.estado === 0 ? (
                          <>
                            <CheckCircle className="size-3 mr-1" />
                            Disponivel
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3 mr-1" />
                            Manutencao
                          </>
                        )}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="size-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="size-4 mr-2" />
                            Ver Reservas
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proximas Reservas</CardTitle>
              <CardDescription>Reservas agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservas.map((reserva) => {
                  const espaco = instalacoes.find(i => i.id === reserva.espacoId);
                  return (
                    <div
                      key={reserva.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div>
                        <p className="font-medium">{espaco?.nome || "EspaÃ§o Desconhecido"}</p>
                        <p className="text-sm text-muted-foreground">{reserva.titulo}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(reserva.dataInicio).toLocaleDateString("pt-PT")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(reserva.dataInicio).toLocaleTimeString("pt-PT", {hour: '2-digit', minute:'2-digit'})} - {new Date(reserva.dataFim).toLocaleTimeString("pt-PT", {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDeleteReserva(reserva.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
