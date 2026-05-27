"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Search, Plus, UserCheck, AlertTriangle, Calendar } from "lucide-react"

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

interface Socio {
  id: string
  numeroSocio: string
  nome: string
  email: string
  telefone: string
  tipo: string
  estado: string
  dataInscricao: string
  quotasEmDia: boolean
}

export default function GerenciaSociosPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newSocio, setNewSocio] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "Regular",
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    fetchSocios()
  }, [router])

  const fetchSocios = async () => {
    try {
      setLoading(true)
      const data = await fetchApi<Socio[]>("/api/users/socios")
      setSocios(data)
    } catch (e) {
      console.error("Erro ao carregar sócios", e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSocio = async () => {
    if (!newSocio.nome || !newSocio.email) return
    setIsSaving(true)
    try {
      await fetchApi("/api/users/socios", {
        method: "POST",
        body: JSON.stringify(newSocio),
      })
      setIsCreateOpen(false)
      setNewSocio({ nome: "", email: "", telefone: "", tipo: "Regular" })
      fetchSocios()
    } catch (e) {
      alert("Erro ao criar sócio.")
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = socios.filter((s) => {
    const matchSearch =
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.numeroSocio || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado =
      filtroEstado === "todos" ||
      s.estado?.toLowerCase() === filtroEstado.toLowerCase()
    return matchSearch && matchEstado
  })

  const ativos = socios.filter((s) => s.estado?.toLowerCase() === "ativo").length
  const suspensos = socios.filter((s) => s.estado?.toLowerCase() === "suspenso").length

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="size-6 text-primary" />
              Gestão de Sócios
            </h1>
            <p className="text-muted-foreground">Consulte e gira todos os membros do CAP.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="size-4 mr-2" />
                Novo Sócio
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Sócio</DialogTitle>
                <DialogDescription>Registe um novo membro no clube.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={newSocio.nome} onChange={e => setNewSocio(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: João Silva" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newSocio.email} onChange={e => setNewSocio(f => ({ ...f, email: e.target.value }))} placeholder="joao@exemplo.pt" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={newSocio.telefone} onChange={e => setNewSocio(f => ({ ...f, telefone: e.target.value }))} placeholder="9xx xxx xxx" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Sócio</Label>
                  <Select value={newSocio.tipo} onValueChange={v => setNewSocio(f => ({ ...f, tipo: v || "Regular" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Jovem">Jovem</SelectItem>
                      <SelectItem value="Honorario">Honorário</SelectItem>
                      <SelectItem value="Fundador">Fundador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateSocio} disabled={isSaving || !newSocio.nome || !newSocio.email}>
                  {isSaving ? "A guardar..." : "Criar Sócio"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Sócios</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{socios.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sócios Ativos</CardTitle>
              <UserCheck className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{ativos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Suspensos</CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{suspensos}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Lista de Sócios</CardTitle>
                <CardDescription>{filtered.length} sócios encontrados</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input className="pl-9 w-64" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filtroEstado} onValueChange={v => setFiltroEstado(v || "todos")}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="suspenso">Suspensos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar sócios...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum sócio encontrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sócio</TableHead>
                    <TableHead>Nº Sócio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Inscrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {s.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{s.nome}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{s.numeroSocio || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.tipo || "Regular"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.estado?.toLowerCase() === "ativo" ? "secondary" : "destructive"}>
                          {s.estado || "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" />
                        {s.dataInscricao ? new Date(s.dataInscricao).toLocaleDateString("pt-PT") : "—"}
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
