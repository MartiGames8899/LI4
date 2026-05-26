"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Atestado {
  id: string
  atleta: {
    id: string
    nome: string
    numero: number
  }
  tipo: "medico" | "desportivo"
  dataEmissao: string
  dataValidade: string
  status: "valido" | "expirado" | "a_expirar"
  ficheiro?: string
}

export default function AtestadosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  const [selectedAtestado, setSelectedAtestado] = useState<Atestado | null>(null)
  const [atestados, setAtestados] = useState<Atestado[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      loadData()
    }
  }, [router])

  const loadData = async () => {
    try {
      const [certRes, athletesRes] = await Promise.all([
        fetchApi<any>("/api/clinical/certificates"),
        fetchApi<any>("/api/users/athletes")
      ])

      const certificates = certRes.data || []
      const athletes = athletesRes.data || []

      const athletesMap = athletes.reduce((acc: any, a: any) => {
        acc[a.id] = a
        return acc
      }, {})

      const now = new Date()
      const in30Days = new Date()
      in30Days.setDate(now.getDate() + 30)

      const mapped: Atestado[] = certificates.map((c: any) => {
        const dataValidade = new Date(c.dataExpiracao)
        let status: "valido" | "expirado" | "a_expirar" = "valido"
        if (dataValidade < now) {
          status = "expirado"
        } else if (dataValidade <= in30Days) {
          status = "a_expirar"
        }

        const athleteInfo = athletesMap[c.atletaId] || { nome: "Desconhecido", numero: 0 }

        return {
          id: c.id,
          atleta: {
            id: c.atletaId,
            nome: athleteInfo.nome,
            numero: athleteInfo.numero
          },
          tipo: "medico",
          dataEmissao: c.dataEmissao.split("T")[0],
          dataValidade: c.dataExpiracao.split("T")[0],
          status,
          ficheiro: c.caminhoFicheiro
        }
      })

      setAtestados(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAtestados = atestados.filter((atestado) => {
    const matchesSearch = atestado.atleta.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || atestado.status === statusFilter
    const matchesTipo = tipoFilter === "todos" || atestado.tipo === tipoFilter
    return matchesSearch && matchesStatus && matchesTipo
  })

  const getStatusBadge = (status: Atestado["status"]) => {
    switch (status) {
      case "valido":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="size-3 mr-1" />
            Valido
          </Badge>
        )
      case "a_expirar":
        return (
          <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">
            <Clock className="size-3 mr-1" />
            A Expirar
          </Badge>
        )
      case "expirado":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="size-3 mr-1" />
            Expirado
          </Badge>
        )
    }
  }

  const stats = {
    total: atestados.length,
    validos: atestados.filter((a) => a.status === "valido").length,
    aExpirar: atestados.filter((a) => a.status === "a_expirar").length,
    expirados: atestados.filter((a) => a.status === "expirado").length,
  }

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Atestados Medicos</h1>
          <p className="text-muted-foreground">Gestao de atestados medicos e desportivos dos atletas</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total de Atestados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-success" />
                <span className="text-2xl font-bold text-success">{stats.validos}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Validos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-cap-gold" />
                <span className="text-2xl font-bold text-cap-gold">{stats.aExpirar}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">A Expirar (30 dias)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{stats.expirados}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Expirados</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {stats.expirados > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Atencao: Atestados Expirados</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Existem {stats.expirados} atleta(s) com atestados expirados. Estes atletas nao podem participar em treinos ou jogos oficiais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atestados</CardTitle>
            <CardDescription>
              {filteredAtestados.length} atestado{filteredAtestados.length !== 1 ? "s" : ""} encontrado{filteredAtestados.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por atleta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "")}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="valido">Validos</SelectItem>
                  <SelectItem value="a_expirar">A Expirar</SelectItem>
                  <SelectItem value="expirado">Expirados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value ?? "")}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="medico">Medico</SelectItem>
                  <SelectItem value="desportivo">Desportivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Emissao</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtestados.map((atestado) => (
                    <TableRow key={atestado.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {atestado.atleta.nome.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{atestado.atleta.nome}</p>
                            <p className="text-xs text-muted-foreground">#{atestado.atleta.numero}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {atestado.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(atestado.dataEmissao).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          {new Date(atestado.dataValidade).toLocaleDateString("pt-PT")}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(atestado.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setSelectedAtestado(atestado)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8">
                            <Download className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedAtestado} onOpenChange={() => setSelectedAtestado(null)}>
          <DialogContent>
            {selectedAtestado && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalhes do Atestado</DialogTitle>
                  <DialogDescription>
                    Informacoes do atestado de {selectedAtestado.atleta.nome}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {selectedAtestado.atleta.nome.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold">{selectedAtestado.atleta.nome}</p>
                      <p className="text-muted-foreground">#{selectedAtestado.atleta.numero}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium capitalize">{selectedAtestado.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(selectedAtestado.status)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Emissao</p>
                      <p className="font-medium">{new Date(selectedAtestado.dataEmissao).toLocaleDateString("pt-PT")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Validade</p>
                      <p className="font-medium">{new Date(selectedAtestado.dataValidade).toLocaleDateString("pt-PT")}</p>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Download className="size-4 mr-2" />
                    Descarregar Atestado
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
