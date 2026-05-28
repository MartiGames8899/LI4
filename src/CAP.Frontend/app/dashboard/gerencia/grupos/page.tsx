"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Send,
  MessageSquare,
  X,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { fetchApi } from "@/lib/api"

interface Grupo {
  id: string
  nome: string
  descricao?: string
  dataCriacao: string
  criadorId: string
  membrosCount: number
  membrosIds: string[]
}

interface Utilizador {
  id: string
  nome: string
  email?: string
  role?: string
}

export default function GerenciaGruposPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Criar grupo
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newGroup, setNewGroup] = useState({ nome: "", descricao: "" })
  const [createSelectedMembers, setCreateSelectedMembers] = useState<string[]>([])
  const [createFilterRole, setCreateFilterRole] = useState("todos")
  const [createSearch, setCreateSearch] = useState("")

  // Editar membros
  const [editMembersOpen, setEditMembersOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<Grupo | null>(null)
  const [editFilterRole, setEditFilterRole] = useState("todos")
  const [editSearch, setEditSearch] = useState("")

  // Enviar mensagem
  const [sendOpen, setSendOpen] = useState(false)
  const [sendGroup, setSendGroup] = useState<Grupo | null>(null)
  const [sendTitulo, setSendTitulo] = useState("")
  const [sendMensagem, setSendMensagem] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    loadAll()
  }, [router])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [g, atletas, staff] = await Promise.all([
        fetchApi<Grupo[]>("/api/notifications/groups").catch(() => [] as Grupo[]),
        fetchApi<any[]>("/api/users/athletes").catch(() => [] as any[]),
        fetchApi<any[]>("/api/users/management/staff").catch(() => [] as any[]),
      ])
      setGrupos(g)

      const allUsers = new Map<string, Utilizador>()
      atletas.forEach((a: any) => allUsers.set(a.id, { id: a.id, nome: a.nome, email: a.email, role: "Atleta" }))
      staff.forEach((s: any) => allUsers.set(s.id, { id: s.id, nome: s.nome, email: s.email, role: s.role }))
      setUtilizadores(Array.from(allUsers.values()).sort((a, b) => a.nome.localeCompare(b.nome)))
    } catch (e) {
      console.error("Erro ao carregar grupos", e)
    } finally {
      setLoading(false)
    }
  }

  const filteredGrupos = useMemo(() => {
    return grupos.filter(g =>
      g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.descricao || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [grupos, searchTerm])

  const filteredUsersForCreate = useMemo(() => {
    return utilizadores.filter(u => {
      const matchRole = createFilterRole === "todos" || u.role === createFilterRole
      const matchSearch = u.nome.toLowerCase().includes(createSearch.toLowerCase())
      return matchRole && matchSearch
    })
  }, [utilizadores, createFilterRole, createSearch])

  const filteredUsersForEdit = useMemo(() => {
    if (!editGroup) return []
    return utilizadores.filter(u => {
      const matchRole = editFilterRole === "todos" || u.role === editFilterRole
      const matchSearch = u.nome.toLowerCase().includes(editSearch.toLowerCase())
      return matchRole && matchSearch
    })
  }, [utilizadores, editFilterRole, editSearch, editGroup])

  const handleOpenCreate = () => {
    setNewGroup({ nome: "", descricao: "" })
    setCreateSelectedMembers([])
    setCreateError(null)
    setCreateFilterRole("todos")
    setCreateSearch("")
    setIsCreateOpen(true)
  }

  const handleCreate = async () => {
    setCreateError(null)
    if (!newGroup.nome.trim()) { setCreateError("Indica o nome do grupo."); return }

    setIsSaving(true)
    try {
      await fetchApi("/api/notifications/groups", {
        method: "POST",
        body: JSON.stringify({
          nome: newGroup.nome,
          descricao: newGroup.descricao || null,
          membrosIds: createSelectedMembers,
        }),
      })
      setIsCreateOpen(false)
      loadAll()
    } catch (e: any) {
      setCreateError(e.message || "Erro ao criar grupo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (g: Grupo) => {
    if (!confirm(`Eliminar grupo "${g.nome}"?`)) return
    try {
      await fetchApi(`/api/notifications/groups/${g.id}`, { method: "DELETE" })
      loadAll()
    } catch (e: any) {
      alert(e.message || "Erro ao eliminar grupo.")
    }
  }

  const openEditMembers = (g: Grupo) => {
    setEditGroup(g)
    setEditFilterRole("todos")
    setEditSearch("")
    setEditMembersOpen(true)
  }

  const toggleMemberInEdit = async (userId: string) => {
    if (!editGroup) return
    const isMember = editGroup.membrosIds.includes(userId)
    try {
      if (isMember) {
        await fetchApi(`/api/notifications/groups/${editGroup.id}/members/${userId}`, { method: "DELETE" })
        const updated = { ...editGroup, membrosIds: editGroup.membrosIds.filter(id => id !== userId), membrosCount: editGroup.membrosCount - 1 }
        setEditGroup(updated)
        setGrupos(prev => prev.map(g => g.id === updated.id ? updated : g))
      } else {
        await fetchApi(`/api/notifications/groups/${editGroup.id}/members`, {
          method: "POST",
          body: JSON.stringify({ utilizadoresIds: [userId] }),
        })
        const updated = { ...editGroup, membrosIds: [...editGroup.membrosIds, userId], membrosCount: editGroup.membrosCount + 1 }
        setEditGroup(updated)
        setGrupos(prev => prev.map(g => g.id === updated.id ? updated : g))
      }
    } catch (e: any) {
      alert(e.message || "Erro ao alterar membro.")
    }
  }

  const openSend = (g: Grupo) => {
    setSendGroup(g)
    setSendTitulo("")
    setSendMensagem("")
    setSendError(null)
    setSendSuccess(null)
    setSendOpen(true)
  }

  const handleSend = async () => {
    if (!sendGroup) return
    setSendError(null)
    setSendSuccess(null)
    if (!sendTitulo.trim() || !sendMensagem.trim()) {
      setSendError("Preenche título e mensagem.")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetchApi<any>(`/api/notifications/send-to-group/${sendGroup.id}`, {
        method: "POST",
        body: JSON.stringify({ titulo: sendTitulo, mensagem: sendMensagem }),
      })
      setSendSuccess(res.message || "Mensagem enviada.")
      setSendTitulo("")
      setSendMensagem("")
      setTimeout(() => { setSendOpen(false); setSendGroup(null) }, 1500)
    } catch (e: any) {
      setSendError(e.message || "Erro ao enviar mensagem.")
    } finally {
      setIsSaving(false)
    }
  }

  const nomeUtilizador = (id: string) => utilizadores.find(u => u.id === id)?.nome ?? id.substring(0, 8)
  const roleUtilizador = (id: string) => utilizadores.find(u => u.id === id)?.role ?? "—"

  const rolesUnicos = useMemo(() => {
    return Array.from(new Set(utilizadores.map(u => u.role).filter(Boolean))) as string[]
  }, [utilizadores])

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="size-6 text-primary" />
              Grupos de Mensagens
            </h1>
            <p className="text-muted-foreground">Crie grupos para enviar mensagens a vários utilizadores de uma só vez.</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="size-4 mr-2" />
            Novo Grupo
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Grupos</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{grupos.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Membros</CardTitle>
              <UserPlus className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {grupos.reduce((acc, g) => acc + g.membrosCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilizadores Disponíveis</CardTitle>
              <Users className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-cap-gold">{utilizadores.length}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Lista de Grupos</CardTitle>
                <CardDescription>{filteredGrupos.length} grupos encontrados</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Pesquisar grupos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar grupos...</p>
            ) : filteredGrupos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="size-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Sem grupos</h3>
                <p className="text-sm text-muted-foreground mb-4">Cria o teu primeiro grupo para enviar mensagens em lote.</p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="size-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredGrupos.map(g => (
                  <Card key={g.id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{g.nome}</h3>
                          {g.descricao && <p className="text-xs text-muted-foreground mt-0.5">{g.descricao}</p>}
                        </div>
                        <Badge variant="secondary">{g.membrosCount} membros</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {g.membrosIds.slice(0, 4).map(uid => (
                          <Badge key={uid} variant="outline" className="text-xs">{nomeUtilizador(uid)}</Badge>
                        ))}
                        {g.membrosIds.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{g.membrosIds.length - 4}</Badge>
                        )}
                        {g.membrosIds.length === 0 && (
                          <span className="text-xs text-muted-foreground">Sem membros</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditMembers(g)}>
                          <UserPlus className="size-3.5 mr-1.5" />
                          Membros
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openSend(g)} disabled={g.membrosCount === 0}>
                          <Send className="size-3.5 mr-1.5" />
                          Enviar
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(g)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Criar Grupo Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Grupo</DialogTitle>
              <DialogDescription>Cria um grupo de utilizadores para envio de mensagens em lote.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {createError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {createError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={newGroup.nome} onChange={e => setNewGroup(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Pais Sub-15" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input value={newGroup.descricao} onChange={e => setNewGroup(f => ({ ...f, descricao: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Membros ({createSelectedMembers.length} selecionados)</Label>
                  <div className="flex gap-2">
                    <Select value={createFilterRole} onValueChange={v => setCreateFilterRole(v ?? "todos")}>
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as funções</SelectItem>
                        {rolesUnicos.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input className="w-40 h-8" placeholder="Pesquisar..." value={createSearch} onChange={e => setCreateSearch(e.target.value)} />
                  </div>
                </div>
                <ScrollArea className="h-64 border rounded-md p-2">
                  <div className="space-y-1">
                    {filteredUsersForCreate.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sem utilizadores.</p>
                    ) : filteredUsersForCreate.map(u => (
                      <div key={u.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                        <Checkbox
                          id={`create-${u.id}`}
                          checked={createSelectedMembers.includes(u.id)}
                          onCheckedChange={() => setCreateSelectedMembers(prev =>
                            prev.includes(u.id) ? prev.filter(x => x !== u.id) : [...prev, u.id]
                          )}
                        />
                        <Label htmlFor={`create-${u.id}`} className="flex-1 cursor-pointer font-normal flex items-center gap-2">
                          <span className="text-sm">{u.nome}</span>
                          <Badge variant="outline" className="text-xs ml-auto">{u.role}</Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving ? "A criar..." : "Criar Grupo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Editar Membros Dialog */}
        <Dialog open={editMembersOpen} onOpenChange={setEditMembersOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerir Membros — {editGroup?.nome}</DialogTitle>
              <DialogDescription>Adiciona ou remove utilizadores do grupo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Select value={editFilterRole} onValueChange={v => setEditFilterRole(v ?? "todos")}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as funções</SelectItem>
                    {rolesUnicos.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input className="flex-1" placeholder="Pesquisar utilizador..." value={editSearch} onChange={e => setEditSearch(e.target.value)} />
              </div>
              <ScrollArea className="h-80 border rounded-md p-2">
                <div className="space-y-1">
                  {filteredUsersForEdit.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Sem utilizadores.</p>
                  ) : filteredUsersForEdit.map(u => {
                    const isMember = editGroup?.membrosIds.includes(u.id)
                    return (
                      <div key={u.id} className={`flex items-center gap-2 p-2 rounded ${isMember ? "bg-primary/5" : "hover:bg-muted/50"}`}>
                        <Checkbox
                          id={`edit-${u.id}`}
                          checked={isMember}
                          onCheckedChange={() => toggleMemberInEdit(u.id)}
                        />
                        <Label htmlFor={`edit-${u.id}`} className="flex-1 cursor-pointer font-normal flex items-center gap-2">
                          <span className="text-sm">{u.nome}</span>
                          <Badge variant="outline" className="text-xs ml-auto">{u.role}</Badge>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button onClick={() => setEditMembersOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enviar Mensagem Dialog */}
        <Dialog open={sendOpen} onOpenChange={setSendOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="size-5" />
                Enviar para "{sendGroup?.nome}"
              </DialogTitle>
              <DialogDescription>
                A mensagem será entregue a {sendGroup?.membrosCount} membro(s) do grupo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {sendError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {sendError}
                </div>
              )}
              {sendSuccess && (
                <div className="p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
                  {sendSuccess}
                </div>
              )}
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={sendTitulo} onChange={e => setSendTitulo(e.target.value)} placeholder="Assunto da mensagem" />
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea value={sendMensagem} onChange={e => setSendMensagem(e.target.value)} placeholder="Escreve a tua mensagem aqui..." className="min-h-[120px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendOpen(false)}>Cancelar</Button>
              <Button onClick={handleSend} disabled={isSaving}>
                <Send className="size-4 mr-2" />
                {isSaving ? "A enviar..." : "Enviar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
