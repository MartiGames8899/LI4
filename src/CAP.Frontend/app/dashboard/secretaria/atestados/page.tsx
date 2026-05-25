"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Heart,
  Search,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
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

const mockAtestados = [
  { id: 1, atleta: "Joao Silva", equipa: "Sub-15", tipo: "desportivo", dataEmissao: "2024-06-15", dataValidade: "2025-06-15", status: "valido" },
  { id: 2, atleta: "Pedro Santos", equipa: "Sub-15", tipo: "medico", dataEmissao: "2024-03-20", dataValidade: "2025-03-20", status: "a_expirar" },
  { id: 3, atleta: "Miguel Costa", equipa: "Sub-13", tipo: "desportivo", dataEmissao: "2023-12-01", dataValidade: "2024-12-01", status: "expirado" },
  { id: 4, atleta: "Tiago Ferreira", equipa: "Sub-15", tipo: "medico", dataEmissao: "2024-08-10", dataValidade: "2025-08-10", status: "valido" },
  { id: 5, atleta: "Maria Silva", equipa: "Sub-11", tipo: "desportivo", dataEmissao: null, dataValidade: null, status: "em_falta" },
  { id: 6, atleta: "Ana Costa", equipa: "Sub-13", tipo: "medico", dataEmissao: "2024-07-22", dataValidade: "2025-07-22", status: "valido" },
]

export default function AtestadosSecretariaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroEquipa, setFiltroEquipa] = useState("todas")

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

  const atestadosFiltrados = mockAtestados.filter((atestado) => {
    const matchSearch = atestado.atleta.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === "todos" || atestado.status === filtroStatus
    const matchEquipa = filtroEquipa === "todas" || atestado.equipa === filtroEquipa
    return matchSearch && matchStatus && matchEquipa
  })

  const stats = {
    total: mockAtestados.length,
    validos: mockAtestados.filter((a) => a.status === "valido").length,
    aExpirar: mockAtestados.filter((a) => a.status === "a_expirar").length,
    expirados: mockAtestados.filter((a) => a.status === "expirado").length,
    emFalta: mockAtestados.filter((a) => a.status === "em_falta").length,
  }

  const getStatusBadge = (status: string) => {
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
      case "em_falta":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="size-3 mr-1" />
            Em Falta
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestao de Atestados</h1>
            <p className="text-muted-foreground">Controle de atestados medicos dos atletas</p>
          </div>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Heart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Validos</CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.validos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">A Expirar</CardTitle>
              <Clock className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{stats.aExpirar}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expirados</CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.expirados}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Falta</CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.emFalta}</div>
            </CardContent>
          </Card>
        </div>

        {(stats.expirados > 0 || stats.emFalta > 0) && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Atencao: Atestados em Falta</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.expirados + stats.emFalta} atleta(s) sem atestado medico valido.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Atestados</CardTitle>
            <CardDescription>{atestadosFiltrados.length} atestado(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
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
              <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v ?? "")}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="valido">Validos</SelectItem>
                  <SelectItem value="a_expirar">A Expirar</SelectItem>
                  <SelectItem value="expirado">Expirados</SelectItem>
                  <SelectItem value="em_falta">Em Falta</SelectItem>
                </SelectContent>
              </Select>
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
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Emissao</TableHead>
                    <TableHead>Data Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atestadosFiltrados.map((atestado) => (
                    <TableRow key={atestado.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {atestado.atleta.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{atestado.atleta}</p>
                            <p className="text-xs text-muted-foreground">{atestado.equipa}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {atestado.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {atestado.dataEmissao
                          ? new Date(atestado.dataEmissao).toLocaleDateString("pt-PT")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {atestado.dataValidade ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            {new Date(atestado.dataValidade).toLocaleDateString("pt-PT")}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(atestado.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-8">
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
      </div>
    </DashboardLayout>
  )
}
