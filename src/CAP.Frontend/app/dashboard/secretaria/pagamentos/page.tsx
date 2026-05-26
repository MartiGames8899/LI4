"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CreditCard,
  Search,
  Download,
  Euro,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
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

import { fetchApi } from "@/lib/api"

interface Pagamento {
  id: string;
  socio: string;
  tipo: string;
  descricao: string;
  valor: number;
  estado: string;
  dataPagamento: string | null;
  metodo: string | null;
}

export default function PagamentosSecretariaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "secretaria") {
      router.push("/")
    } else {
      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await fetchApi<any[]>('/api/finance/payments').catch(() => [])
      
      const mapped: Pagamento[] = data.map(p => ({
        id: p.id,
        socio: p.atleta?.nome || "Sem Nome", // Assuming athlete obj exists or needs fetching
        tipo: "Pagamento API",
        descricao: p.referencia || "Geral",
        valor: p.valor,
        estado: "pago", // Em pagamentos globais assumimos pagos se estao no endpoint base, senÃ£o "pendente" se existirem quotas nao pagas
        dataPagamento: p.dataPagamento || new Date().toISOString(),
        metodo: p.metodo === 1 ? "MBWay" : p.metodo === 2 ? "Multibanco" : "Transferencia"
      }))
      setPagamentos(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const pagamentosFiltrados = pagamentos.filter((pag) => {
    const matchSearch = pag.socio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === "todos" || pag.estado === filtroEstado
    const matchTipo = filtroTipo === "todos" || pag.tipo === filtroTipo
    return matchSearch && matchEstado && matchTipo
  })

  const totalRecebido = pagamentos.filter((p) => p.estado === "pago").reduce((sum, p) => sum + p.valor, 0)
  const totalPendente = pagamentos.filter((p) => p.estado === "pendente" || p.estado === "atrasado").reduce((sum, p) => sum + p.valor, 0)
  const pagos = pagamentos.filter((p) => p.estado === "pago").length
  const atrasados = pagamentos.filter((p) => p.estado === "atrasado").length

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pago":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="size-3 mr-1" />
            Pago
          </Badge>
        )
      case "pendente":
        return (
          <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">
            <Clock className="size-3 mr-1" />
            Pendente
          </Badge>
        )
      case "atrasado":
        return (
          <Badge variant="destructive">
            <AlertCircle className="size-3 mr-1" />
            Atrasado
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
            <h1 className="text-2xl font-bold text-foreground">Gestao de Pagamentos</h1>
            <p className="text-muted-foreground">Controle de todos os pagamentos recebidos</p>
          </div>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Recebido
              </CardTitle>
              <Euro className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{totalRecebido.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">Este periodo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pendente
              </CardTitle>
              <Clock className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{totalPendente.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">A receber</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagamentos
              </CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagos}</div>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atrasados
              </CardTitle>
              <AlertCircle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{atrasados}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registo de Pagamentos</CardTitle>
            <CardDescription>{pagamentosFiltrados.length} pagamento(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por socio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v ?? "")}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pago">Pagos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="atrasado">Atrasados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v ?? "")}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Quota Mensal">Quotas</SelectItem>
                  <SelectItem value="Inscricao">Inscricoes</SelectItem>
                  <SelectItem value="Equipamento">Equipamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Socio</TableHead>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Data Pagamento</TableHead>
                    <TableHead className="hidden md:table-cell">Metodo</TableHead>
                    <TableHead className="text-right">Recibo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosFiltrados.map((pag) => (
                    <TableRow key={pag.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {pag.socio.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{pag.socio}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{pag.tipo}</p>
                          <p className="text-xs text-muted-foreground">{pag.descricao}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{pag.valor.toFixed(2)} EUR</TableCell>
                      <TableCell>{getEstadoBadge(pag.estado)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pag.dataPagamento
                          ? new Date(pag.dataPagamento).toLocaleDateString("pt-PT")
                          : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pag.metodo || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {pag.estado === "pago" && (
                          <Button variant="ghost" size="sm">
                            <Download className="size-4" />
                          </Button>
                        )}
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
