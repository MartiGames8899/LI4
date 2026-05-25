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

const mockInstalacoes = [
  { id: 1, nome: "Campo Principal", tipo: "campo", capacidade: 200, estado: "disponivel" },
  { id: 2, nome: "Campo Secundario", tipo: "campo", capacidade: 100, estado: "disponivel" },
  { id: 3, nome: "Pavilhao Gimnodesportivo", tipo: "pavilhao", capacidade: 500, estado: "manutencao" },
  { id: 4, nome: "Sala de Reunioes", tipo: "sala", capacidade: 20, estado: "disponivel" },
]

const mockReservas = [
  { id: 1, instalacao: "Campo Principal", equipa: "Sub-15", data: "2025-01-27", hora: "18:30-20:00", responsavel: "Carlos Treinador" },
  { id: 2, instalacao: "Campo Principal", equipa: "Sub-13", data: "2025-01-28", hora: "17:00-18:30", responsavel: "Manuel Treinador" },
  { id: 3, instalacao: "Campo Secundario", equipa: "Sub-11", data: "2025-01-27", hora: "17:00-18:30", responsavel: "Ana Treinadora" },
  { id: 4, instalacao: "Sala de Reunioes", equipa: "Direcao", data: "2025-01-29", hora: "20:00-21:00", responsavel: "Jose Presidente" },
]

export default function InstalacoesSecretariaPage() {
  const router = useRouter()
  const [novaReservaOpen, setNovaReservaOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "secretaria") {
      router.push("/")
    }
  }, [router])

  const disponiveis = mockInstalacoes.filter((i) => i.estado === "disponivel").length
  const reservasHoje = mockReservas.filter((r) => r.data === "2025-01-27").length

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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a instalacao" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInstalacoes
                        .filter((i) => i.estado === "disponivel")
                        .map((i) => (
                          <SelectItem key={i.id} value={i.id.toString()}>
                            {i.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Equipa/Grupo</Label>
                  <Input placeholder="Ex: Sub-15, Direcao, etc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Horario</Label>
                    <Input placeholder="18:30-20:00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Responsavel</Label>
                  <Input placeholder="Nome do responsavel" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNovaReservaOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setNovaReservaOpen(false)}>
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
              <div className="text-2xl font-bold">{mockInstalacoes.length}</div>
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
              <div className="text-2xl font-bold">{mockReservas.length}</div>
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
                {mockInstalacoes.map((instalacao) => (
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
                          Capacidade: {instalacao.capacidade}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={instalacao.estado === "disponivel" ? "secondary" : "outline"}
                        className={instalacao.estado === "disponivel" ? "bg-success/10 text-success" : ""}
                      >
                        {instalacao.estado === "disponivel" ? (
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
                {mockReservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div>
                      <p className="font-medium">{reserva.instalacao}</p>
                      <p className="text-sm text-muted-foreground">{reserva.equipa}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(reserva.data).toLocaleDateString("pt-PT")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {reserva.hora}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
