"use client"

import { useState, useEffect } from "react"
import { fetchApi } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Search, Plus, Users, UserCheck, UserX, Mail, Phone, Edit, Eye, Filter, Download } from "lucide-react"

interface Socio {
  id: string;
  numeroSocio: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  estado: string;
  dataInscricao: string;
  quotasEmDia: boolean;
}

export default function SociosSecretariaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [novoSocioOpen, setNovoSocioOpen] = useState(false)
  const [socios, setSocios] = useState<Socio[]>([])
  
  // Novo socio form state
  const [novoNome, setNovoNome] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novoTelefone, setNovoTelefone] = useState("")
  const [novoTipo, setNovoTipo] = useState("regular")
  const [novoDataInscricao, setNovoDataInscricao] = useState("")

  const carregarSocios = async () => {
    try {
      const data = await fetchApi<Socio[]>('/api/users/socios')
      setSocios(data)
    } catch (err) {
      console.error("Erro ao carregar socios", err)
    }
  }

  useEffect(() => {
    carregarSocios()
  }, [])

  const handleCriarSocio = async () => {
    try {
      await fetchApi('/api/users/socios', {
        method: 'POST',
        body: JSON.stringify({
          nome: novoNome,
          email: novoEmail,
          telefone: novoTelefone,
          tipo: novoTipo,
          dataInscricao: novoDataInscricao ? new Date(novoDataInscricao).toISOString() : null
        })
      })
      setNovoSocioOpen(false)
      carregarSocios() // reload
    } catch (err) {
      console.error("Erro ao criar socio", err)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Numero Socio", "Nome", "Email", "Telefone", "Tipo", "Estado", "Data Inscricao"]
    const rows = sociosFiltrados.map(s => [s.numeroSocio, s.nome, s.email, s.telefone, s.tipo, s.estado, s.dataInscricao ? new Date(s.dataInscricao).toLocaleDateString("pt-PT") : ""])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "socios.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const sociosFiltrados = socios.filter(socio => {
    const matchSearch = socio.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       socio.numeroSocio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       socio.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === "todos" || socio.estado?.toLowerCase() === filtroEstado
    const matchTipo = filtroTipo === "todos" || socio.tipo?.toLowerCase() === filtroTipo
    return matchSearch && matchEstado && matchTipo
  })

  const totalAtivos = socios.filter(s => s.estado?.toLowerCase() === "ativo").length
  const totalSuspensos = socios.filter(s => s.estado?.toLowerCase() === "suspenso").length
  const quotasEmAtraso = socios.filter(s => !s.quotasEmDia).length

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestao de Socios</h1>
            <p className="text-muted-foreground">Registe, edite e consulte informacoes dos socios do clube</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 size-4" />
              Exportar
            </Button>
            <Dialog open={novoSocioOpen} onOpenChange={setNovoSocioOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 size-4" />
                  Novo Socio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registar Novo Socio</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo socio do clube
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="nome">Nome Completo</FieldLabel>
                      <Input id="nome" placeholder="Nome do socio" value={novoNome} onChange={e => setNovoNome(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="tipo">Tipo de Socio</FieldLabel>
                      <Select value={novoTipo} onValueChange={(v) => setNovoTipo(v ?? "regular")}>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Selecionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="jovem">Jovem (ate 18 anos)</SelectItem>
                          <SelectItem value="honorario">Honorario</SelectItem>
                          <SelectItem value="fundador">Fundador</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" placeholder="email@exemplo.com" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
                    <Input id="telefone" type="tel" placeholder="912345678" value={novoTelefone} onChange={e => setNovoTelefone(e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="dataNascimento">Data de Nascimento (Opcional)</FieldLabel>
                      <Input id="dataNascimento" type="date" value={novoDataInscricao} onChange={e => setNovoDataInscricao(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="nif">NIF</FieldLabel>
                      <Input id="nif" placeholder="123456789" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="morada">Morada</FieldLabel>
                    <Input id="morada" placeholder="Rua, numero, codigo postal" />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNovoSocioOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCriarSocio}>
                    Registar Socio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Socios</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{socios.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Socios Ativos</CardTitle>
              <UserCheck className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalAtivos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Socios Suspensos</CardTitle>
              <UserX className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totalSuspensos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quotas em Atraso</CardTitle>
              <Badge variant="destructive">{quotasEmAtraso}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{quotasEmAtraso}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Pesquisa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, numero ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroEstado} onValueChange={(value) => setFiltroEstado(value ?? "")}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={(value) => setFiltroTipo(value ?? "")}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="jovem">Jovem</SelectItem>
                  <SelectItem value="honorario">Honorario</SelectItem>
                  <SelectItem value="fundador">Fundador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Socios</CardTitle>
            <CardDescription>
              {sociosFiltrados.length} socio(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N. Socio</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Quotas</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sociosFiltrados.map((socio) => (
                  <TableRow key={socio.id}>
                    <TableCell className="font-mono text-sm">{socio.numeroSocio}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{socio.nome}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{socio.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="size-3" />
                          {socio.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="size-3" />
                          {socio.telefone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {socio.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={socio.estado === "ativo" ? "secondary" : "destructive"}>
                        {socio.estado === "ativo" ? "Ativo" : "Suspenso"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={socio.quotasEmDia ? "secondary" : "destructive"}>
                        {socio.quotasEmDia ? "Em dia" : "Em atraso"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8">
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Edit className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
