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
import { Checkbox } from "@/components/ui/checkbox"
import { fetchApi } from "@/lib/api"

interface Convocatoria {
  id: string
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
    id: string
    nome: string
    resposta: "confirmado" | "recusado" | "pendente"
    motivo?: string
  }[]
}

interface Equipa {
  id: string
  nome: string
}

const emptyCreate = { titulo: "", tipo: "treino", data: "", hora: "", local: "", equipaId: "" }

interface AtletaSimple {
  id: string
  nome: string
}

export default function ConvocatoriasPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("todas")
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingConvocatoria, setEditingConvocatoria] = useState<Convocatoria | null>(null)
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([])
  const [equipas, setEquipas] = useState<Equipa[]>([])
  const [createForm, setCreateForm] = useState(emptyCreate)
  const [editForm, setEditForm] = useState({ titulo: "", data: "", hora: "", local: "" })
  const [isSaving, setIsSaving] = useState(false)

  // Athlete selection state
  const [atletasDisponiveis, setAtletasDisponiveis] = useState<AtletaSimple[]>([])
  const [selectedAtletasIds, setSelectedAtletasIds] = useState<string[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "treinador") {
      router.push("/")
    } else {
      fetchConvocatorias()
      fetchEquipas()
      fetchAtletas()
    }
  }, [router])

  const fetchAtletas = async () => {
    try {
      const data = await fetchApi<any[]>("api/users/athletes")
      setAtletasDisponiveis(data.map(d => ({ id: d.id, nome: d.nome, equipa: d.equipa })))
    } catch {
      setAtletasDisponiveis([])
    }
  }

  const handleToggleAthlete = (id: string) => {
    setSelectedAtletasIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const filteredAtletas = createForm.equipaId 
      ? atletasDisponiveis.filter((a: any) => a.equipa === equipas.find(e => e.id === createForm.equipaId)?.nome)
      : atletasDisponiveis
    setSelectedAtletasIds(filteredAtletas.map(a => a.id))
  }

  const fetchConvocatorias = async () => {
    try {
      const data = await fetchApi<any[]>("/api/sports/convocations")
      setConvocatorias(data)
    } catch (error) {
      console.error("Erro ao buscar convocatórias", error)
    }
  }

  const fetchEquipas = async () => {
    try {
      const data = await fetchApi<Equipa[]>("/api/sports/teams")
      setEquipas(data)
    } catch {
      setEquipas([])
    }
  }

  const handleCriarEnviar = async () => {
    if (!createForm.titulo || !createForm.data || !createForm.hora || !createForm.local) return
    setIsSaving(true)
    try {
      const dataEvento = new Date(`${createForm.data}T${createForm.hora}`).toISOString()
      const equipaId = createForm.equipaId || (equipas[0]?.id ?? "00000000-0000-0000-0000-000000000000")
      const created = await fetchApi<any>("/api/sports/convocations", {
        method: "POST",
        body: JSON.stringify({
          titulo: createForm.titulo,
          dataEvento,
          local: createForm.local,
          equipaId,
          atletasIds: selectedAtletasIds,
        }),
      })
      // auto-publish
      await fetchApi(`/api/sports/convocations/${created.id}/publish`, { method: "PATCH" }).catch(() => null)
      setIsCreateDialogOpen(false)
      setCreateForm(emptyCreate)
      setSelectedAtletasIds([])
      fetchConvocatorias()
    } catch (e) {
      console.error(e)
      alert("Erro ao criar convocatória")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditConvocatoria = (conv: Convocatoria) => {
    setEditingConvocatoria(conv)
    setEditForm({ titulo: conv.titulo, data: conv.data, hora: conv.hora, local: conv.local })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingConvocatoria) return
    setIsSaving(true)
    try {
      const dataEvento = new Date(`${editForm.data}T${editForm.hora}`).toISOString()
      await fetchApi(`/api/sports/convocations/${editingConvocatoria.id}`, {
        method: "PATCH",
        body: JSON.stringify({ titulo: editForm.titulo, dataEvento, local: editForm.local }),
      })
      setIsEditDialogOpen(false)
      fetchConvocatorias()
    } catch (e) {
      console.error(e)
      alert("Erro ao editar convocatória")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConvocatoria = async (id: string) => {
    if (!confirm("Eliminar esta convocatória?")) return
    try {
      await fetchApi(`/api/sports/convocations/${id}`, { method: "DELETE" })
      setConvocatorias(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error(e)
      alert("Erro ao eliminar convocatória")
    }
  }

  const handlePublicar = async (conv: Convocatoria) => {
    try {
      await fetchApi(`/api/sports/convocations/${conv.id}/publish`, { method: "PATCH" })
      fetchConvocatorias()
    } catch (e) {
      console.error(e)
    }
  }

  const filteredConvocatorias = convocatorias.filter((c) => {
    if (activeTab === "todas") return true
    if (activeTab === "enviadas") return c.status === "enviada"
    if (activeTab === "rascunhos") return c.status === "rascunho"
    if (activeTab === "fechadas") return c.status === "fechada"
    return true
  })

  const getTipoBadge = (tipo: Convocatoria["tipo"]) => {
    switch (tipo) {
      case "jogo": return <Badge className="bg-cap-red/10 text-cap-red border-cap-red/20">Jogo</Badge>
      case "treino": return <Badge className="bg-cap-navy/10 text-cap-navy border-cap-navy/20">Treino</Badge>
      case "evento": return <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">Evento</Badge>
    }
  }

  const getStatusBadge = (status: Convocatoria["status"]) => {
    switch (status) {
      case "rascunho": return <Badge variant="outline">Rascunho</Badge>
      case "enviada": return <Badge className="bg-success/10 text-success border-success/20">Enviada</Badge>
      case "fechada": return <Badge variant="secondary">Fechada</Badge>
    }
  }

  // Helper to get filtered athletes in the dialog
  const athletesToShow = createForm.equipaId 
    ? atletasDisponiveis.filter((a: any) => a.equipa === equipas.find(e => e.id === createForm.equipaId)?.nome)
    : []

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Convocatorias</h1>
            <p className="text-muted-foreground">Gestao de convocatorias para treinos e jogos</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="size-4 mr-2" />
                Nova Convocatoria
              </Button>
            } />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Convocatoria</DialogTitle>
                <DialogDescription>Crie uma nova convocatoria para treino, jogo ou evento.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Titulo</Label>
                  <Input id="titulo" placeholder="Ex: Jogo vs FC Exemplo" value={createForm.titulo} onChange={e => setCreateForm(f => ({ ...f, titulo: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Equipa</Label>
                    <Select value={createForm.equipaId} onValueChange={v => {
                      setCreateForm(f => ({ ...f, equipaId: v ?? "" }))
                      setSelectedAtletasIds([]) // Reset selection when team changes
                    }}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {equipas.map(e => <SelectItem key={e.id} value={e.id} label={e.nome}>{e.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input id="local" placeholder="Ex: Campo Principal" value={createForm.local} onChange={e => setCreateForm(f => ({ ...f, local: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" type="date" value={createForm.data} onChange={e => setCreateForm(f => ({ ...f, data: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input id="hora" type="time" value={createForm.hora} onChange={e => setCreateForm(f => ({ ...f, hora: e.target.value }))} />
                  </div>
                </div>

                {createForm.equipaId && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Atletas ({selectedAtletasIds.length} selecionados)</Label>
                      <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-7 text-xs">
                        Selecionar Todos
                      </Button>
                    </div>
                    <ScrollArea className="h-40 border rounded-md p-2">
                      <div className="space-y-2">
                        {athletesToShow.map(a => (
                          <div key={a.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`atleta-${a.id}`} 
                              checked={selectedAtletasIds.includes(a.id)}
                              onCheckedChange={() => handleToggleAthlete(a.id)}
                            />
                            <Label htmlFor={`atleta-${a.id}`} className="text-sm font-normal cursor-pointer">
                              {a.nome}
                            </Label>
                          </div>
                        ))}
                        {athletesToShow.length === 0 && (
                          <p className="text-center text-muted-foreground text-xs py-4">Nenhum atleta nesta equipa.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCriarEnviar} disabled={isSaving || !createForm.titulo || !createForm.data || !createForm.hora || !createForm.local}>
                  <Send className="size-4 mr-2" />
                  {isSaving ? "A criar..." : "Criar e Enviar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{convocatorias.filter((c) => c.status === "enviada").length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-success" />
                <span className="text-2xl font-bold text-success">{convocatorias.reduce((acc, c) => acc + (c.respostas?.confirmados ?? 0), 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{convocatorias.reduce((acc, c) => acc + (c.respostas?.recusados ?? 0), 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recusados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-cap-gold" />
                <span className="text-2xl font-bold text-cap-gold">{convocatorias.reduce((acc, c) => acc + (c.respostas?.pendentes ?? 0), 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
            </CardContent>
          </Card>
        </div>

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
                              {convocatoria.status === "rascunho" && (
                                <DropdownMenuItem onClick={() => handlePublicar(convocatoria)}>
                                  <Send className="size-4 mr-2" />
                                  Publicar
                                </DropdownMenuItem>
                              )}
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
                            {convocatoria.data ? new Date(convocatoria.data).toLocaleDateString("pt-PT") : ""} - {convocatoria.hora}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            {convocatoria.local}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-4" />
                            {(convocatoria.respostas?.confirmados ?? 0) + (convocatoria.respostas?.recusados ?? 0) + (convocatoria.respostas?.pendentes ?? 0)} convocados
                          </span>
                        </div>
                      </div>

                      <div className="flex md:flex-col justify-between md:justify-center items-center gap-4 p-6 bg-secondary/30 md:w-48">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">{convocatoria.respostas?.confirmados ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Confirmados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-destructive">{convocatoria.respostas?.recusados ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Recusados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cap-gold">{convocatoria.respostas?.pendentes ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Pendentes</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredConvocatorias.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhuma convocatória encontrada.</p>
              )}
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
                    {selectedConvocatoria.data ? new Date(selectedConvocatoria.data).toLocaleDateString("pt-PT") : ""} as {selectedConvocatoria.hora} - {selectedConvocatoria.local}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Respostas dos Atletas</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {(selectedConvocatoria.atletas ?? []).map((atleta) => (
                          <div key={atleta.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                  {atleta.nome.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{atleta.nome}</p>
                                {atleta.motivo && <p className="text-xs text-muted-foreground">{atleta.motivo}</p>}
                              </div>
                            </div>
                            {atleta.resposta === "confirmado" && (
                              <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="size-3 mr-1" />Confirmado</Badge>
                            )}
                            {atleta.resposta === "recusado" && (
                              <Badge variant="destructive"><XCircle className="size-3 mr-1" />Recusado</Badge>
                            )}
                            {atleta.resposta === "pendente" && (
                              <Badge variant="outline"><Clock className="size-3 mr-1" />Pendente</Badge>
                            )}
                          </div>
                        ))}
                        {(selectedConvocatoria.atletas ?? []).length === 0 && (
                          <p className="text-center text-muted-foreground text-sm py-4">Nenhum atleta convocado.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedConvocatoria(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Convocatoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={editForm.titulo} onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input value={editForm.local} onChange={e => setEditForm(f => ({ ...f, local: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={editForm.data} onChange={e => setEditForm(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" value={editForm.hora} onChange={e => setEditForm(f => ({ ...f, hora: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "A guardar..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
