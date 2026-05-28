"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Plus,
  Search,
  Mail,
  Copy,
  Power,
  Trash2,
  UserCog,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { fetchApi } from "@/lib/api"

interface Utilizador {
  id: string
  nome: string
  email: string
  telefone?: string
  role: string
  estado: string
  numeroSocio?: string
  dataInscricao?: string
  isPending?: boolean
}

const ROLES_GERIVEIS = [
  { v: "Treinador", l: "Treinador" },
  { v: "Secretaria", l: "Secretaria" },
  { v: "Gerencia", l: "Gerência" },
]

export default function GerenciaUtilizadoresPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroRole, setFiltroRole] = useState("todos")

  // Criar
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newUser, setNewUser] = useState({ nome: "", email: "", role: "Treinador" })
  const [isSaving, setIsSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [lastInvitationToken, setLastInvitationToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await fetchApi<Utilizador[]>("/api/users/management/staff")
      setUtilizadores(data)
    } catch (e) {
      console.error("Erro ao carregar utilizadores", e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreateError(null)
    if (!newUser.nome.trim()) { setCreateError("Indica o nome."); return }
    if (!newUser.email.trim()) { setCreateError("Indica o email."); return }

    setIsSaving(true)
    try {
      const res = await fetchApi<any>("/api/users/auth/register", {
        method: "POST",
        body: JSON.stringify(newUser),
      })
      if (res.invitationToken) {
        setLastInvitationToken(res.invitationToken)
      } else {
        handleCloseDialog()
      }
      loadUsers()
    } catch (e: any) {
      setCreateError(e.message || "Erro ao criar utilizador.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setLastInvitationToken(null)
    setNewUser({ nome: "", email: "", role: "Treinador" })
    setCreateError(null)
  }

  const copyInvitationLink = () => {
    if (!lastInvitationToken) return
    const url = `${window.location.origin}/auth/setup-password?token=${lastInvitationToken}`
    navigator.clipboard.writeText(url)
    alert("Link de convite copiado!")
  }

  const handleToggleEstado = async (u: Utilizador) => {
    const novoEstado = u.estado === "Ativo" ? "Suspenso" : "Ativo"
    const acao = novoEstado === "Suspenso" ? "suspender" : "reativar"
    if (!confirm(`Tens a certeza que queres ${acao} ${u.nome}?`)) return

    try {
      await fetchApi(`/api/users/management/${u.id}/state`, {
        method: "PUT",
        body: JSON.stringify({ estado: novoEstado }),
      })
      loadUsers()
    } catch (e: any) {
      alert(e.message || `Erro ao ${acao} utilizador.`)
    }
  }

  const handleDelete = async (u: Utilizador) => {
    if (!confirm(`Eliminar utilizador "${u.nome}"? Esta ação é irreversível.`)) return

    try {
      await fetchApi(`/api/users/management/${u.id}`, {
        method: "DELETE",
      })
      loadUsers()
    } catch (e: any) {
      alert(e.message || "Erro ao eliminar utilizador.")
    }
  }

  const utilizadoresFiltrados = useMemo(() => {
    return utilizadores.filter(u => {
      const matchSearch =
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = filtroRole === "todos" || u.role === filtroRole
      return matchSearch && matchRole
    })
  }, [utilizadores, searchTerm, filtroRole])

  const treinadores = utilizadores.filter(u => u.role === "Treinador").length
  const secretarias = utilizadores.filter(u => u.role === "Secretaria").length
  const gerentes = utilizadores.filter(u => u.role === "Gerencia").length
  const pendentes = utilizadores.filter(u => u.isPending).length

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserCog className="size-6 text-primary" />
              Gestão de Utilizadores
            </h1>
            <p className="text-muted-foreground">Crie e administre contas de staff (treinadores, secretaria, gerência).</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(o) => !o && handleCloseDialog()}>
            <DialogTrigger render={
              <Button>
                <Plus className="size-4 mr-2" />
                Novo Utilizador
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{lastInvitationToken ? "Utilizador Criado" : "Novo Utilizador"}</DialogTitle>
                <DialogDescription>
                  {lastInvitationToken
                    ? "Partilhe o link abaixo para o utilizador configurar a sua palavra-passe."
                    : "Cria uma conta de staff. O utilizador receberá um convite para configurar a sua palavra-passe."}
                </DialogDescription>
              </DialogHeader>

              {lastInvitationToken ? (
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-muted rounded-lg border flex flex-col gap-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Link de Convite</p>
                    <code className="text-sm break-all bg-background p-2 rounded border">
                      {`${window.location.origin}/auth/setup-password?token=${lastInvitationToken}`}
                    </code>
                  </div>
                  <Button className="w-full" onClick={copyInvitationLink}>
                    <Copy className="size-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {createError && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {createError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={newUser.nome}
                      onChange={e => setNewUser(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Ex: Carlos Mendes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@cap.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Select value={newUser.role} onValueChange={v => setNewUser(f => ({ ...f, role: v ?? "Treinador" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES_GERIVEIS.map(r => (
                          <SelectItem key={r.v} value={r.v} label={r.l}>{r.l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter>
                {lastInvitationToken ? (
                  <Button onClick={handleCloseDialog}>Concluir</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleCreate} disabled={isSaving}>
                      {isSaving ? "A criar..." : "Criar Utilizador"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Treinadores</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{treinadores}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Secretaria</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{secretarias}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gerência</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{gerentes}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Por Ativar</CardTitle>
              <Clock className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-cap-gold">{pendentes}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Lista de Utilizadores</CardTitle>
                <CardDescription>{utilizadoresFiltrados.length} utilizadores encontrados</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input className="pl-9 w-56" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filtroRole} onValueChange={v => setFiltroRole(v ?? "todos")}>
                  <SelectTrigger className="w-40">
                    <Filter className="size-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as funções</SelectItem>
                    {ROLES_GERIVEIS.map(r => (
                      <SelectItem key={r.v} value={r.v} label={r.l}>{r.l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar utilizadores...</p>
            ) : utilizadoresFiltrados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum utilizador encontrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utilizadoresFiltrados.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {u.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{u.nome}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {u.isPending ? (
                          <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">
                            <Clock className="size-3 mr-1" />
                            Por Ativar
                          </Badge>
                        ) : u.estado === "Ativo" ? (
                          <Badge className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="size-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Suspenso</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.telefone || "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="size-8">
                              <UserCog className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${u.email}`}>
                              <Mail className="size-4 mr-2" />
                              Enviar Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleEstado(u)}>
                              <Power className="size-4 mr-2" />
                              {u.estado === "Ativo" ? "Suspender" : "Reativar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(u)}>
                              <Trash2 className="size-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
