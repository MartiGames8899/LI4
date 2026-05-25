"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertTriangle,
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

interface Atleta {
  id: number
  nome: string
  numero: number
  posicao: string
  idade: number
  email: string
  telefone: string
  atestadoValido: boolean
  atestadoExpira?: string
  presencaMedia: number
  status: "ativo" | "lesionado" | "suspenso"
}

const mockAtletas: Atleta[] = [
  { id: 1, nome: "Joao Silva", numero: 10, posicao: "Avancado", idade: 16, email: "joao@email.com", telefone: "912345678", atestadoValido: true, atestadoExpira: "2025-06-15", presencaMedia: 95, status: "ativo" },
  { id: 2, nome: "Pedro Santos", numero: 7, posicao: "Medio", idade: 15, email: "pedro@email.com", telefone: "913456789", atestadoValido: true, atestadoExpira: "2025-03-20", presencaMedia: 92, status: "ativo" },
  { id: 3, nome: "Miguel Costa", numero: 4, posicao: "Defesa", idade: 16, email: "miguel@email.com", telefone: "914567890", atestadoValido: false, presencaMedia: 90, status: "lesionado" },
  { id: 4, nome: "Tiago Ferreira", numero: 1, posicao: "Guarda-Redes", idade: 17, email: "tiago@email.com", telefone: "915678901", atestadoValido: true, atestadoExpira: "2025-08-10", presencaMedia: 88, status: "ativo" },
  { id: 5, nome: "Andre Oliveira", numero: 9, posicao: "Avancado", idade: 15, email: "andre@email.com", telefone: "916789012", atestadoValido: true, atestadoExpira: "2025-04-05", presencaMedia: 85, status: "ativo" },
  { id: 6, nome: "Bruno Martins", numero: 6, posicao: "Medio", idade: 16, email: "bruno@email.com", telefone: "917890123", atestadoValido: true, atestadoExpira: "2025-07-22", presencaMedia: 82, status: "suspenso" },
  { id: 7, nome: "Carlos Almeida", numero: 3, posicao: "Defesa", idade: 15, email: "carlos@email.com", telefone: "918901234", atestadoValido: false, presencaMedia: 78, status: "ativo" },
  { id: 8, nome: "Daniel Sousa", numero: 8, posicao: "Medio", idade: 16, email: "daniel@email.com", telefone: "919012345", atestadoValido: true, atestadoExpira: "2025-05-30", presencaMedia: 91, status: "ativo" },
]

export default function PlantelPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [posicaoFilter, setPosicaoFilter] = useState<string>("todas")
  const [statusFilter, setStatusFilter] = useState<string>("todos")

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

  const filteredAtletas = mockAtletas.filter((atleta) => {
    const matchesSearch = atleta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.numero.toString().includes(searchTerm)
    const matchesPosicao = posicaoFilter === "todas" || atleta.posicao === posicaoFilter
    const matchesStatus = statusFilter === "todos" || atleta.status === statusFilter
    return matchesSearch && matchesPosicao && matchesStatus
  })

  const getStatusBadge = (status: Atleta["status"]) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>
      case "lesionado":
        return <Badge variant="destructive">Lesionado</Badge>
      case "suspenso":
        return <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">Suspenso</Badge>
    }
  }

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plantel</h1>
            <p className="text-muted-foreground">Gestao de atletas da equipa</p>
          </div>
          <Button>
            <Plus className="size-4 mr-2" />
            Adicionar Atleta
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{mockAtletas.length}</div>
              <p className="text-xs text-muted-foreground">Total de Atletas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {mockAtletas.filter((a) => a.status === "ativo").length}
              </div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-cap-red">
                {mockAtletas.filter((a) => !a.atestadoValido).length}
              </div>
              <p className="text-xs text-muted-foreground">Sem Atestado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-cap-gold">
                {Math.round(mockAtletas.reduce((acc, a) => acc + a.presencaMedia, 0) / mockAtletas.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Presenca Media</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atletas</CardTitle>
            <CardDescription>
              {filteredAtletas.length} atleta{filteredAtletas.length !== 1 ? "s" : ""} encontrado{filteredAtletas.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou numero..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={posicaoFilter} onValueChange={setPosicaoFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Posicao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Posicoes</SelectItem>
                  <SelectItem value="Guarda-Redes">Guarda-Redes</SelectItem>
                  <SelectItem value="Defesa">Defesa</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Avancado">Avancado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="lesionado">Lesionados</SelectItem>
                  <SelectItem value="suspenso">Suspensos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Posicao</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Atestado</TableHead>
                    <TableHead>Presenca</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtletas.map((atleta) => (
                    <TableRow key={atleta.id}>
                      <TableCell className="font-bold">{atleta.numero}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {atleta.nome.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{atleta.nome}</p>
                            <p className="text-xs text-muted-foreground">{atleta.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{atleta.posicao}</TableCell>
                      <TableCell>{atleta.idade} anos</TableCell>
                      <TableCell>
                        {atleta.atestadoValido ? (
                          <Badge variant="outline" className="text-success border-success/30">
                            <FileText className="size-3 mr-1" />
                            Valido
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="size-3" />
                            Em Falta
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cap-gold rounded-full"
                              style={{ width: `${atleta.presencaMedia}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{atleta.presencaMedia}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(atleta.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="size-4 mr-2" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="size-4 mr-2" />
                              Historico
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="size-4 mr-2" />
                              Enviar Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="size-4 mr-2" />
                              Contactar
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
