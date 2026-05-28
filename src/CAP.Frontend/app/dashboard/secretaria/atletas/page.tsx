"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Edit,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { fetchApi } from "@/lib/api"

interface Atleta {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  equipa: string;
  numero: number;
  posicao: string;
  atestadoValido: boolean;
  estado: string; // "ativo", "inativo"
}

export default function AtletasSecretariaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEquipa, setFiltroEquipa] = useState("todas")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  const [atletas, setAtletas] = useState<Atleta[]>([])
  const [loading, setLoading] = useState(true)

  // Create athlete state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newAthlete, setNewAthlete] = useState({ nome: "", email: "", role: "Atleta" })
  const [isSaving, setIsSaving] = useState(false)
  const [lastInvitationToken, setLastInvitationToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "secretaria") {
      router.push("/")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await fetchApi<Atleta[]>("/api/users/athletes")
      setAtletas(data)
    } catch (e) {
      console.error("Erro ao carregar atletas", e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAthlete = async () => {
    if (!newAthlete.nome || !newAthlete.email) return
    setIsSaving(true)
    try {
      const res = await fetchApi<any>('api/users/auth/register', {
        method: 'POST',
        body: JSON.stringify(newAthlete)
      })
      if (res.invitationToken) {
        setLastInvitationToken(res.invitationToken)
      } else {
        setIsCreateOpen(false)
        setNewAthlete({ nome: "", email: "", role: "Atleta" })
      }
      fetchData()
    } catch (e) {
      console.error(e)
      alert("Erro ao criar atleta")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setLastInvitationToken(null)
    setNewAthlete({ nome: "", email: "", role: "Atleta" })
  }

  const copyInvitationLink = () => {
    if (!lastInvitationToken) return
    const url = `${window.location.origin}/auth/setup-password?token=${lastInvitationToken}`
    navigator.clipboard.writeText(url)
    alert("Link de convite copiado para a área de transferência!")
  }

  const handleExportCSV = () => {
    if (atletas.length === 0) {
      alert("Não há atletas para exportar.")
      return
    }
    const headers = ["Nome", "Email", "Telefone", "Equipa", "Número", "Posição", "Atestado", "Estado"]
    const rows = atletas.map(a => [
      a.nome,
      a.email,
      a.telefone || "",
      a.equipa || "",
      a.numero?.toString() || "",
      a.posicao || "",
      a.atestadoValido ? "Válido" : "Em Falta",
      a.estado === "ativo" ? "Ativo" : "Inativo",
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `atletas_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const atletasFiltrados = atletas.filter(a => {
    const matchSearch =
      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEquipa = filtroEquipa === "todas" || a.equipa === filtroEquipa
    const matchEstado = filtroEstado === "todos" || a.estado === filtroEstado
    return matchSearch && matchEquipa && matchEstado
  })

  const totalAtivos = atletas.filter((a) => a.estado === "ativo").length
  const semAtestado = atletas.filter((a) => !a.atestadoValido).length

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestao de Atletas</h1>
            <p className="text-muted-foreground">Registe e consulte informacoes dos atletas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileText className="size-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
              <DialogTrigger render={
                <Button>
                  <Plus className="size-4 mr-2" />
                  Novo Atleta
                </Button>
              } />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lastInvitationToken ? "Atleta Registado!" : "Novo Atleta"}</DialogTitle>
                  <DialogDescription>
                    {lastInvitationToken 
                      ? "O atleta foi criado com sucesso. Partilhe o link abaixo para que ele possa configurar a sua palavra-passe." 
                      : "Crie uma nova conta de atleta. O atleta receberá um convite para configurar os seus acessos."}
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
                      <FileText className="size-4 mr-2" />
                      Copiar Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input 
                        id="nome" 
                        value={newAthlete.nome} 
                        onChange={e => setNewAthlete(f => ({ ...f, nome: e.target.value }))}
                        placeholder="Ex: João Silva" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={newAthlete.email} 
                        onChange={e => setNewAthlete(f => ({ ...f, email: e.target.value }))}
                        placeholder="atleta@exemplo.pt" 
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {lastInvitationToken ? (
                    <Button onClick={handleCloseDialog}>Concluir</Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                      <Button onClick={handleCreateAthlete} disabled={isSaving || !newAthlete.nome || !newAthlete.email}>
                        {isSaving ? "A Guardar..." : "Criar Atleta"}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Atletas
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{atletas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ativos
              </CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{totalAtivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sem Atestado
              </CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{semAtestado}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Equipas
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(atletas.map((a) => a.equipa)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Atletas</CardTitle>
            <CardDescription>{atletasFiltrados.length} atleta(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroEquipa} onValueChange={(v) => setFiltroEquipa(v ?? "")}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Equipa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {Array.from(new Set(atletas.map(a => a.equipa))).map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v ?? "")}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Equipa</TableHead>
                    <TableHead className="hidden md:table-cell">Contacto</TableHead>
                    <TableHead>Atestado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atletasFiltrados.map((atleta) => (
                    <TableRow key={atleta.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {atleta.nome.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{atleta.nome}</p>
                            <p className="text-xs text-muted-foreground">#{atleta.numero} - {atleta.posicao}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{atleta.equipa}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" />
                            {atleta.email}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="size-3" />
                            {atleta.telefone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {atleta.atestadoValido ? (
                          <Badge variant="outline" className="text-success border-success/30">
                            <CheckCircle className="size-3 mr-1" />
                            Valido
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="size-3 mr-1" />
                            Em Falta
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={atleta.estado === "ativo" ? "secondary" : "outline"}>
                          {atleta.estado === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="size-4 mr-2" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="size-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="size-4 mr-2" />
                              Documentos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
