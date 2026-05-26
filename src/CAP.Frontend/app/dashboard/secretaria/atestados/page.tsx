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

interface Atestado {
  id: string;
  atleta: string;
  equipa: string;
  tipo: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  status: string;
  caminhoFicheiro?: string;
}

export default function AtestadosSecretariaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroEquipa, setFiltroEquipa] = useState("todas")

  const [atestados, setAtestados] = useState<Atestado[]>([])

  useEffect(() => {
    const carregarAtestados = async () => {
      try {
        const { fetchApi } = await import('@/lib/api')
        const data = await fetchApi<any[]>('/api/clinical/certificates')
        setAtestados(data.map(a => ({
          id: a.id,
          atleta: "Atleta Desconhecido",
          equipa: "Sem Equipa",
          tipo: "medico",
          dataEmissao: a.dataEmissao,
          dataValidade: a.dataExpiracao,
          status: new Date(a.dataExpiracao) < new Date() ? "expirado" : "valido",
          caminhoFicheiro: a.caminhoFicheiro,
        })))
      } catch (err) {
        console.error("Erro ao carregar atestados", err)
      }
    }
    carregarAtestados()
  }, [])

  const handleExportCSV = () => {
    const headers = ["Atleta", "Equipa", "Tipo", "Data Emissao", "Data Validade", "Estado"]
    const rows = atestadosFiltrados.map(a => [a.atleta, a.equipa, a.tipo, a.dataEmissao ? new Date(a.dataEmissao).toLocaleDateString("pt-PT") : "-", a.dataValidade ? new Date(a.dataValidade).toLocaleDateString("pt-PT") : "-", a.status])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "atestados.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const handleVerAtestado = (atestado: Atestado) => {
    if (atestado.caminhoFicheiro) {
      window.open(`http://localhost:5000${atestado.caminhoFicheiro}`, "_blank")
    } else {
      alert("Ficheiro não disponível")
    }
  }

  const handleDownloadAtestado = async (atestado: Atestado) => {
    if (!atestado.caminhoFicheiro) { alert("Ficheiro não disponível"); return }
    try {
      const token = localStorage.getItem("cap_token")
      const res = await fetch(`http://localhost:5000${atestado.caminhoFicheiro}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Erro ao descarregar")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url; a.download = `atestado-${atestado.id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Erro ao descarregar ficheiro")
    }
  }

  const atestadosFiltrados = atestados.filter((atestado) => {
    const matchSearch = atestado.atleta.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === "todos" || atestado.status === filtroStatus
    const matchEquipa = filtroEquipa === "todas" || atestado.equipa === filtroEquipa
    return matchSearch && matchStatus && matchEquipa
  })

  const stats = {
    total: atestados.length,
    validos: atestados.filter((a) => a.status === "valido").length,
    aExpirar: atestados.filter((a) => a.status === "a_expirar").length,
    expirados: atestados.filter((a) => a.status === "expirado").length,
    emFalta: atestados.filter((a) => a.status === "em_falta").length,
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
          <Button variant="outline" onClick={handleExportCSV}>
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
                              {atestado.atleta.split(" ").map((n: string) => n[0]).join("")}
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
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleVerAtestado(atestado)}>
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleDownloadAtestado(atestado)}>
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
