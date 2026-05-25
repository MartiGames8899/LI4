"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Convocatoria {
  id: number
  titulo: string
  tipo: "treino" | "jogo" | "evento"
  data: string
  hora: string
  local: string
  adversario?: string
  descricao?: string
  status: "rascunho" | "enviada" | "fechada"
  respostas: {
    confirmados: number
    recusados: number
    pendentes: number
  }
  atletas: {
    id: number
    nome: string
    resposta: "confirmado" | "recusado" | "pendente"
    motivo?: string
  }[]
}

const mockConvocatorias: Convocatoria[] = [
  {
    id: 1,
    titulo: "Jogo vs FC Exemplo",
    tipo: "jogo",
    data: "2025-01-25",
    hora: "15:00",
    local: "Campo Visitante",
    adversario: "FC Exemplo",
    descricao: "Jogo da 15a jornada do campeonato distrital.",
    status: "enviada",
    respostas: { confirmados: 18, recusados: 2, pendentes: 4 },
    atletas: [
      { id: 1, nome: "Joao Silva", resposta: "confirmado" },
      { id: 2, nome: "Pedro Santos", resposta: "confirmado" },
      { id: 3, nome: "Miguel Costa", resposta: "recusado", motivo: "Lesao" },
      { id: 4, nome: "Tiago Ferreira", resposta: "pendente" },
      { id: 5, nome: "Andre Oliveira", resposta: "confirmado" },
    ],
  },
  {
    id: 2,
    titulo: "Treino Especial",
    tipo: "treino",
    data: "2025-01-26",
    hora: "10:00",
    local: "Campo Principal",
    descricao: "Treino de preparacao para o jogo.",
    status: "enviada",
    respostas: { confirmados: 12, recusados: 5, pendentes: 7 },
    atletas: [
      { id: 1, nome: "Joao Silva", resposta: "confirmado" },
      { id: 2, nome: "Pedro Santos", resposta: "pendente" },
      { id: 3, nome: "Miguel Costa", resposta: "recusado", motivo: "Lesao" },
    ],
  },
  {
    id: 3,
    titulo: "Treino Semanal",
    tipo: "treino",
    data: "2025-01-27",
    hora: "18:30",
    local: "Campo Principal",
    status: "rascunho",
    respostas: { confirmados: 0, recusados: 0, pendentes: 24 },
    atletas: [],
  },
]

export default function ConvocatoriasPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("todas")
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingConvocatoria, setEditingConvocatoria] = useState<Convocatoria | null>(null)
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>(mockConvocatorias)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "treinador") {
      router.push("/")
    }
  }, [router])

  const filteredConvocatorias = convocatorias.filter((c) => {
    if (activeTab === "todas") return true
    if (activeTab === "enviadas") return c.status === "enviada"
    if (activeTab === "rascunhos") return c.status === "rascunho"
    if (activeTab === "fechadas") return c.status === "fechada"
    return true
  })

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

  const getStatusBadge = (status: Convocatoria["status"]) => {
    switch (status) {
      case "rascunho":
        return <Badge variant="outline">Rascunho</Badge>
      case "enviada":
        return <Badge className="bg-success/10 text-success border-success/20">Enviada</Badge>
      case "fechada":
        return <Badge variant="secondary">Fechada</Badge>
    }
  }

  const handleEditConvocatoria = (conv: Convocatoria) => {
    setEditingConvocatoria(conv)
    setIsEditDialogOpen(true)
  }

  const handleDeleteConvocatoria = (id: number) => {
    setConvocatorias(prev => prev.filter(c => c.id !== id))
  }

  const handleReenviarNotificacao = () => {
    // Simula reenvio de notificacao
    setSelectedConvocatoria(null)
  }

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Convocatorias</h1>
            <p className="text-muted-foreground">Gestao de convocatorias para treinos e jogos</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger>
              <Button>
                <Plus className="size-4 mr-2" />
                Nova Convocatoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Convocatoria</DialogTitle>
                <DialogDescription>
                  Crie uma nova convocatoria para treino, jogo ou evento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Titulo</Label>
                  <Input id="titulo" placeholder="Ex: Jogo vs FC Exemplo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treino">Treino</SelectItem>
                        <SelectItem value="jogo">Jogo</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adversario">Adversario (opcional)</Label>
                    <Input id="adversario" placeholder="Ex: FC Exemplo" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input id="hora" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input id="local" placeholder="Ex: Campo Principal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descricao (opcional)</Label>
                  <Textarea id="descricao" placeholder="Informacoes adicionais..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  <Send className="size-4 mr-2" />
                  Criar e Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{mockConvocatorias.filter((c) => c.status === "enviada").length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-success" />
                <span className="text-2xl font-bold text-success">
                  {mockConvocatorias.reduce((acc, c) => acc + c.respostas.confirmados, 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-destructive" />
                <span className="text-2xl font-bold text-destructive">
                  {mockConvocatorias.reduce((acc, c) => acc + c.respostas.recusados, 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recusados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-cap-gold" />
                <span className="text-2xl font-bold text-cap-gold">
                  {mockConvocatorias.reduce((acc, c) => acc + c.respostas.pendentes, 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value ?? "")}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="enviadas">Enviadas</TabsTrigger>
            <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
            <TabsTrigger value="fechadas">Fechadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid gap-4">
              {filteredConvocatorias.map((convocatoria) => (
                <Card key={convocatoria.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Main Info */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTipoBadge(convocatoria.tipo)}
                            {getStatusBadge(convocatoria.status)}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedConvocatoria(convocatoria)}>
                                <Eye className="size-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditConvocatoria(convocatoria)}>
                                <Edit className="size-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteConvocatoria(convocatoria.id)}>
                                <Trash2 className="size-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="text-lg font-semibold mb-2">{convocatoria.titulo}</h3>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            {new Date(convocatoria.data).toLocaleDateString("pt-PT")} - {convocatoria.hora}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            {convocatoria.local}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-4" />
                            {convocatoria.respostas.confirmados + convocatoria.respostas.recusados + convocatoria.respostas.pendentes} convocados
                          </span>
                        </div>

                        {convocatoria.descricao && (
                          <p className="text-sm text-muted-foreground mt-3">{convocatoria.descricao}</p>
                        )}
                      </div>

                      {/* Response Stats */}
                      <div className="flex md:flex-col justify-between md:justify-center items-center gap-4 p-6 bg-secondary/30 md:w-48">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">{convocatoria.respostas.confirmados}</div>
                          <div className="text-xs text-muted-foreground">Confirmados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-destructive">{convocatoria.respostas.recusados}</div>
                          <div className="text-xs text-muted-foreground">Recusados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cap-gold">{convocatoria.respostas.pendentes}</div>
                          <div className="text-xs text-muted-foreground">Pendentes</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={!!selectedConvocatoria} onOpenChange={() => setSelectedConvocatoria(null)}>
          <DialogContent className="max-w-2xl">
            {selectedConvocatoria && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {getTipoBadge(selectedConvocatoria.tipo)}
                    {getStatusBadge(selectedConvocatoria.status)}
                  </div>
                  <DialogTitle>{selectedConvocatoria.titulo}</DialogTitle>
                  <DialogDescription>
                    {new Date(selectedConvocatoria.data).toLocaleDateString("pt-PT")} as {selectedConvocatoria.hora} - {selectedConvocatoria.local}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {selectedConvocatoria.descricao && (
                    <p className="text-sm text-muted-foreground">{selectedConvocatoria.descricao}</p>
                  )}

                  <div>
                    <h4 className="font-medium mb-3">Respostas dos Atletas</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {selectedConvocatoria.atletas.map((atleta) => (
                          <div key={atleta.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                  {atleta.nome.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{atleta.nome}</p>
                                {atleta.motivo && (
                                  <p className="text-xs text-muted-foreground">{atleta.motivo}</p>
                                )}
                              </div>
                            </div>
                            {atleta.resposta === "confirmado" && (
                              <Badge className="bg-success/10 text-success border-success/20">
                                <CheckCircle className="size-3 mr-1" />
                                Confirmado
                              </Badge>
                            )}
                            {atleta.resposta === "recusado" && (
                              <Badge variant="destructive">
                                <XCircle className="size-3 mr-1" />
                                Recusado
                              </Badge>
                            )}
                            {atleta.resposta === "pendente" && (
                              <Badge variant="outline">
                                <Clock className="size-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedConvocatoria(null)}>
                    Fechar
                  </Button>
                  <Button onClick={handleReenviarNotificacao}>
                    <Send className="size-4 mr-2" />
                    Reenviar Notificacao
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
