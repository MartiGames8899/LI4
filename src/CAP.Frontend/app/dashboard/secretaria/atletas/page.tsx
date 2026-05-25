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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const mockAtletas = [
  { id: 1, nome: "Joao Silva", email: "joao@email.com", telefone: "912345678", equipa: "Sub-15", posicao: "Avancado", numero: 10, atestadoValido: true, estado: "ativo" },
  { id: 2, nome: "Pedro Santos", email: "pedro@email.com", telefone: "913456789", equipa: "Sub-15", posicao: "Medio", numero: 7, atestadoValido: true, estado: "ativo" },
  { id: 3, nome: "Miguel Costa", email: "miguel@email.com", telefone: "914567890", equipa: "Sub-13", posicao: "Defesa", numero: 4, atestadoValido: false, estado: "ativo" },
  { id: 4, nome: "Tiago Ferreira", email: "tiago@email.com", telefone: "915678901", equipa: "Sub-15", posicao: "Guarda-Redes", numero: 1, atestadoValido: true, estado: "ativo" },
  { id: 5, nome: "Maria Silva", email: "maria@email.com", telefone: "916789012", equipa: "Sub-11", posicao: "Medio", numero: 8, atestadoValido: false, estado: "ativo" },
  { id: 6, nome: "Ana Costa", email: "ana@email.com", telefone: "917890123", equipa: "Sub-13", posicao: "Avancado", numero: 9, atestadoValido: true, estado: "inativo" },
]

export default function AtletasSecretariaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEquipa, setFiltroEquipa] = useState("todas")
  const [filtroEstado, setFiltroEstado] = useState("todos")

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

  const atletasFiltrados = mockAtletas.filter((atleta) => {
    const matchSearch = atleta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEquipa = filtroEquipa === "todas" || atleta.equipa === filtroEquipa
    const matchEstado = filtroEstado === "todos" || atleta.estado === filtroEstado
    return matchSearch && matchEquipa && matchEstado
  })

  const totalAtivos = mockAtletas.filter((a) => a.estado === "ativo").length
  const semAtestado = mockAtletas.filter((a) => !a.atestadoValido).length

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestao de Atletas</h1>
            <p className="text-muted-foreground">Registe e consulte informacoes dos atletas</p>
          </div>
          <Button>
            <Plus className="size-4 mr-2" />
            Novo Atleta
          </Button>
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
              <div className="text-2xl font-bold">{mockAtletas.length}</div>
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
                {new Set(mockAtletas.map((a) => a.equipa)).size}
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
                  <SelectItem value="Sub-11">Sub-11</SelectItem>
                  <SelectItem value="Sub-13">Sub-13</SelectItem>
                  <SelectItem value="Sub-15">Sub-15</SelectItem>
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
                              {atleta.nome.split(" ").map((n) => n[0]).join("")}
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
