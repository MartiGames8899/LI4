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
  Eye,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Atleta {
  id: string
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

const mockAtletas: Atleta[] = []

export default function PlantelPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [posicaoFilter, setPosicaoFilter] = useState<string>("todas")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAtleta, setSelectedAtleta] = useState<Atleta | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [atletas, setAtletas] = useState<Atleta[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "treinador") {
      router.push("/")
    } else {
      fetchAtletas()
    }
  }, [router])

  const fetchAtletas = async () => {
    try {
      const { fetchApi } = await import("@/lib/api")
      const data = await fetchApi<any>("/api/users/athletes")
      setAtletas(data)
    } catch (error) {
      console.error("Erro ao buscar atletas", error)
    }
  }

  const filteredAtletas = atletas.filter((atleta) => {
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
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Adicionar Atleta
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{atletas.length}</div>
              <p className="text-xs text-muted-foreground">Total de Atletas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {atletas.filter((a) => a.status === "ativo").length}
              </div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-cap-red">
                {atletas.filter((a) => !a.atestadoValido).length}
              </div>
              <p className="text-xs text-muted-foreground">Sem Atestado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-cap-gold">
                {atletas.length > 0 ? Math.round(atletas.reduce((acc, a) => acc + a.presencaMedia, 0) / atletas.length) : 0}%
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
              <Select value={posicaoFilter} onValueChange={(value) => setPosicaoFilter(value ?? "")}>
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
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "")}>
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
                              {atleta.nome.split(" ").map((n: string) => n[0]).join("")}
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
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedAtleta(atleta); setIsProfileDialogOpen(true); }}>
                              <FileText className="size-4 mr-2" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/dashboard/treinador/presencas")}>
                              <Calendar className="size-4 mr-2" />
                              Historico
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`mailto:${atleta.email}`)}>
                              <Mail className="size-4 mr-2" />
                              Enviar Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`tel:${atleta.telefone}`)}>
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

        {/* Add Atleta Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Atleta</DialogTitle>
              <DialogDescription>
                Adicione um novo atleta ao plantel da equipa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" placeholder="Ex: Joao Silva" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Numero</Label>
                  <Input id="numero" type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posicao">Posicao</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guarda-redes">Guarda-Redes</SelectItem>
                      <SelectItem value="defesa">Defesa</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="avancado">Avancado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade</Label>
                  <Input id="idade" type="number" placeholder="16" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="912345678" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="atleta@email.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Adicionar Atleta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-md">
            {selectedAtleta && (
              <>
                <DialogHeader>
                  <DialogTitle>Perfil do Atleta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {selectedAtleta.nome.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedAtleta.nome}</h3>
                      <p className="text-muted-foreground">#{selectedAtleta.numero} - {selectedAtleta.posicao}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Idade</p>
                      <p className="font-medium">{selectedAtleta.idade} anos</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Presenca</p>
                      <p className="font-medium">{selectedAtleta.presencaMedia}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{selectedAtleta.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{selectedAtleta.telefone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Atestado</p>
                      {selectedAtleta.atestadoValido ? (
                        <Badge className="bg-success/10 text-success border-success/20">Valido</Badge>
                      ) : (
                        <Badge variant="destructive">Em Falta</Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(selectedAtleta.status)}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                    Fechar
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
