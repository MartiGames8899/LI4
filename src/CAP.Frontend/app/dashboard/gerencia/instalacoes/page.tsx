"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Calendar, Clock, Plus, CheckCircle, AlertTriangle, Wrench, Edit } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
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
  tipo: string | number
  capacidade: number
  ativo?: boolean
  estado?: number
  observacoes?: string
}

interface Reserva {
  id: string
  espacoId: string
  titulo: string
  dataInicio: string
  dataFim: string
}

const TIPOS = [
  { v: "CampoRelvado", l: "Campo Relvado" },
  { v: "Pavilhao", l: "Pavilhão" },
  { v: "Ginasio", l: "Ginásio" },
  { v: "Balneario", l: "Balneário" },
]

const tipoLabel = (tipo: string | number) => {
  if (typeof tipo === "number") return TIPOS[tipo]?.l ?? "—"
  return TIPOS.find(t => t.v === tipo)?.l ?? tipo
}

const isEspacoAtivo = (i: Instalacao) => {
  if (typeof i.ativo === "boolean") return i.ativo
  if (typeof i.estado === "number") return i.estado === 0
  return true
}

export default function GerenciaInstalacoesPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [instalacoes, setInstalacoes] = useState<Instalacao[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  // Nova reserva
  const [novaReservaOpen, setNovaReservaOpen] = useState(false)
  const [novaReserva, setNovaReserva] = useState({
    espacoId: "",
    titulo: "",
    data: "",
    horaInicio: "",
    horaFim: "",
  })
  const [reservaError, setReservaError] = useState<string | null>(null)

  // Novo espaço
  const [novoEspacoOpen, setNovoEspacoOpen] = useState(false)
  const [novoEspaco, setNovoEspaco] = useState({
    nome: "",
    tipo: "CampoRelvado",
    capacidade: 0,
    observacoes: "",
  })
  const [espacoError, setEspacoError] = useState<string | null>(null)

  // Editar espaço
  const [editEspacoOpen, setEditEspacoOpen] = useState(false)
  const [editEspaco, setEditEspaco] = useState<{ id: string, nome: string, tipo: string, capacidade: number, observacoes: string, ativo: boolean } | null>(null)

  // Manutenção
  const [manutOpen, setManutOpen] = useState(false)
  const [manutEspaco, setManutEspaco] = useState<Instalacao | null>(null)
  const [manutObservacoes, setManutObservacoes] = useState("")

  const [isSaving, setIsSaving] = useState(false)

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
    setReservaError(null)
    if (!novaReserva.espacoId || !novaReserva.titulo || !novaReserva.data) {
      setReservaError("Preenche espaço, título e data.")
      return
    }
    setIsSaving(true)
    try {
      const dataInicio = new Date(`${novaReserva.data}T${novaReserva.horaInicio || "09:00"}`)
      const dataFim = new Date(`${novaReserva.data}T${novaReserva.horaFim || "10:00"}`)
      if (dataFim <= dataInicio) {
        setReservaError("A hora de fim tem de ser depois da hora de início.")
        setIsSaving(false)
        return
      }
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
    } catch (e: any) {
      setReservaError(e.message || "Erro ao criar reserva (possível conflito de horário).")
    } finally {
      setIsSaving(false)
    }
  }

  const handleNovoEspaco = async () => {
    setEspacoError(null)
    if (!novoEspaco.nome.trim()) { setEspacoError("Indica o nome do espaço."); return }
    if (novoEspaco.capacidade < 0) { setEspacoError("Capacidade inválida."); return }

    setIsSaving(true)
    try {
      await fetchApi("/api/facilities/spaces", {
        method: "POST",
        body: JSON.stringify(novoEspaco),
      })
      setNovoEspacoOpen(false)
      setNovoEspaco({ nome: "", tipo: "CampoRelvado", capacidade: 0, observacoes: "" })
      loadData()
    } catch (e: any) {
      setEspacoError(e.message || "Erro ao criar espaço.")
    } finally {
      setIsSaving(false)
    }
  }

  const openEdit = (i: Instalacao) => {
    setEditEspaco({
      id: i.id,
      nome: i.nome,
      tipo: typeof i.tipo === "number" ? TIPOS[i.tipo]?.v ?? "CampoRelvado" : (i.tipo as string),
      capacidade: i.capacidade,
      observacoes: i.observacoes || "",
      ativo: isEspacoAtivo(i),
    })
    setEditEspacoOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editEspaco) return
    setIsSaving(true)
    try {
      await fetchApi(`/api/facilities/spaces/${editEspaco.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: editEspaco.nome,
          tipo: editEspaco.tipo,
          capacidade: editEspaco.capacidade,
          observacoes: editEspaco.observacoes,
          ativo: editEspaco.ativo,
        }),
      })
      setEditEspacoOpen(false)
      setEditEspaco(null)
      loadData()
    } catch (e: any) {
      alert(e.message || "Erro ao guardar espaço.")
    } finally {
      setIsSaving(false)
    }
  }

  const openManutencao = (i: Instalacao) => {
    setManutEspaco(i)
    setManutObservacoes(i.observacoes || "")
    setManutOpen(true)
  }

  const handleToggleManutencao = async () => {
    if (!manutEspaco) return
    setIsSaving(true)
    try {
      const emManutencao = isEspacoAtivo(manutEspaco) // se estiver ativo agora, vai para manutenção
      await fetchApi(`/api/facilities/spaces/${manutEspaco.id}/maintenance`, {
        method: "PATCH",
        body: JSON.stringify({
          emManutencao,
          observacoes: manutObservacoes,
        }),
      })
      setManutOpen(false)
      setManutEspaco(null)
      loadData()
    } catch (e: any) {
      alert(e.message || "Erro ao alterar estado do espaço.")
    } finally {
      setIsSaving(false)
    }
  }

  const disponiveis = instalacoes.filter(isEspacoAtivo).length
  const emManutencao = instalacoes.filter(i => !isEspacoAtivo(i)).length

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
          <div className="flex gap-2">
            <Dialog open={novoEspacoOpen} onOpenChange={setNovoEspacoOpen}>
              <DialogTrigger render={
                <Button variant="outline">
                  <Plus className="size-4 mr-2" />
                  Novo Espaço
                </Button>
              } />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Espaço</DialogTitle>
                  <DialogDescription>Adicione um novo espaço ao clube.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {espacoError && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {espacoError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={novoEspaco.nome} onChange={e => setNovoEspaco(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Campo Principal" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={novoEspaco.tipo} onValueChange={v => setNovoEspaco(f => ({ ...f, tipo: v ?? "CampoRelvado" }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TIPOS.map(t => <SelectItem key={t.v} value={t.v} label={t.l}>{t.l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Capacidade</Label>
                      <Input type="number" min={0} value={novoEspaco.capacidade} onChange={e => setNovoEspaco(f => ({ ...f, capacidade: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={novoEspaco.observacoes} onChange={e => setNovoEspaco(f => ({ ...f, observacoes: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNovoEspacoOpen(false)}>Cancelar</Button>
                  <Button onClick={handleNovoEspaco} disabled={isSaving}>
                    {isSaving ? "A guardar..." : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                  {reservaError && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {reservaError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Espaço</Label>
                    <Select value={novaReserva.espacoId} onValueChange={v => setNovaReserva(f => ({ ...f, espacoId: v || "" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um espaço" />
                      </SelectTrigger>
                      <SelectContent>
                        {instalacoes.filter(isEspacoAtivo).map(i => (
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
                  <Button onClick={handleNovaReserva} disabled={isSaving}>
                    {isSaving ? "A guardar..." : "Criar Reserva"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{i.nome}</p>
                        <p className="text-xs text-muted-foreground">{tipoLabel(i.tipo)} · Cap. {i.capacidade}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isEspacoAtivo(i) ? "secondary" : "destructive"}>
                          {isEspacoAtivo(i) ? "Disponível" : "Manutenção"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(i)}>
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => openManutencao(i)}
                          title={isEspacoAtivo(i) ? "Marcar em manutenção" : "Reativar"}
                        >
                          <Wrench className="size-3.5" />
                        </Button>
                      </div>
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

        {/* Editar Espaço Dialog */}
        <Dialog open={editEspacoOpen} onOpenChange={setEditEspacoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Espaço</DialogTitle>
            </DialogHeader>
            {editEspaco && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={editEspaco.nome} onChange={e => setEditEspaco(p => p ? { ...p, nome: e.target.value } : p)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={editEspaco.tipo} onValueChange={v => setEditEspaco(p => p ? { ...p, tipo: v ?? p.tipo } : p)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPOS.map(t => <SelectItem key={t.v} value={t.v} label={t.l}>{t.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacidade</Label>
                    <Input type="number" min={0} value={editEspaco.capacidade} onChange={e => setEditEspaco(p => p ? { ...p, capacidade: parseInt(e.target.value) || 0 } : p)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={editEspaco.observacoes} onChange={e => setEditEspaco(p => p ? { ...p, observacoes: e.target.value } : p)} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditEspacoOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "A guardar..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manutenção Dialog */}
        <Dialog open={manutOpen} onOpenChange={setManutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{manutEspaco && isEspacoAtivo(manutEspaco) ? "Marcar em Manutenção" : "Reativar Espaço"}</DialogTitle>
              <DialogDescription>
                {manutEspaco && isEspacoAtivo(manutEspaco)
                  ? "O espaço ficará indisponível para reservas até ser reativado."
                  : "O espaço voltará a estar disponível para reservas."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Textarea
                  value={manutObservacoes}
                  onChange={e => setManutObservacoes(e.target.value)}
                  placeholder="Motivo da manutenção, data prevista de regresso, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setManutOpen(false)}>Cancelar</Button>
              <Button onClick={handleToggleManutencao} disabled={isSaving} variant={manutEspaco && isEspacoAtivo(manutEspaco) ? "destructive" : "default"}>
                {isSaving ? "A guardar..." : manutEspaco && isEspacoAtivo(manutEspaco) ? "Marcar Manutenção" : "Reativar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
