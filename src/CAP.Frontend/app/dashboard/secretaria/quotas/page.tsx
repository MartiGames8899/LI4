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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Search, Plus, Euro, Calendar, CheckCircle, AlertCircle, Clock, Send, Download, Filter } from "lucide-react"

interface Quota {
  id: string;
  socio?: string;
  numeroSocio?: string;
  atletaId: string;
  mes: string;
  ano: number;
  valor: number;
  valorTotal?: number;
  estado: string;
  dataVencimento?: string;
  dataPagamento?: string;
  metodoPagamento?: string;
}

const valoresQuota = {
  fundador: 15.00,
  regular: 20.00,
  jovem: 10.00,
  honorario: 0.00
}

export default function QuotasSecretariaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroMes, setFiltroMes] = useState("todos")
  const [registarPagamentoOpen, setRegistarPagamentoOpen] = useState(false)
  const [emitirQuotasOpen, setEmitirQuotasOpen] = useState(false)
  const [quotaSelecionada, setQuotaSelecionada] = useState<Quota | null>(null)
  
  const [quotas, setQuotas] = useState<Quota[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [dataPagamento, setDataPagamento] = useState("")
  const [isSavingPayment, setIsSavingPayment] = useState(false)

  const carregarQuotas = async () => {
    try {
      const data = await fetchApi<any[]>('/api/finance/quotas')
      const formatadas = data.map(q => ({
        id: q.id,
        atletaId: q.atletaId,
        socio: "Socio (Desconhecido)",
        numeroSocio: "N/A",
        mes: new Date(q.dataVencimento).toLocaleString('pt-PT', { month: 'long' }),
        ano: new Date(q.dataVencimento).getFullYear(),
        valor: q.valorTotal,
        estado: q.estado === 0 ? "pendente" : q.estado === 2 ? "pago" : "atrasado",
        dataVencimento: q.dataVencimento,
      }))
      setQuotas(formatadas)
    } catch (err) {
      console.error("Erro ao carregar quotas", err)
    }
  }

  useEffect(() => {
    carregarQuotas()
  }, [])

  const handleEmitirQuotas = async () => {
    setIsGenerating(true)
    try {
      const atletas = await fetchApi<any[]>('/api/users/athletes')
      const definicoes = await fetchApi<any[]>('/api/finance/quotas/types').catch(() => [])
      const definicao = definicoes[0]
      if (!definicao) { alert("Nenhum tipo de quota configurado. Crie primeiro um tipo de quota."); return }
      const dataVenc = new Date(); dataVenc.setDate(8)
      await Promise.all(atletas.map(a =>
        fetchApi('/api/finance/quotas/assign', {
          method: 'POST',
          body: JSON.stringify({ atletaId: a.id, quotaDefinicaoId: definicao.id, dataVencimento: dataVenc.toISOString() })
        }).catch(() => null)
      ))
      setEmitirQuotasOpen(false)
      carregarQuotas()
    } catch (err) {
      console.error("Erro ao emitir quotas", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegistarPagamento = async (quota: Quota) => {
    if (!metodoPagamento) { alert("Selecione o método de pagamento"); return }
    setIsSavingPayment(true)
    try {
      await fetchApi('/api/finance/payments', {
        method: 'POST',
        body: JSON.stringify({ atletaId: quota.atletaId, valor: quota.valor, quotasIds: [quota.id], metodo: metodoPagamento, referencia: null })
      })
      setRegistarPagamentoOpen(false)
      setQuotaSelecionada(null)
      setMetodoPagamento("")
      setDataPagamento("")
      carregarQuotas()
    } catch (err) {
      console.error("Erro ao registar pagamento", err)
      alert("Erro ao registar pagamento")
    } finally {
      setIsSavingPayment(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Socio", "Numero Socio", "Mes", "Ano", "Valor (EUR)", "Estado"]
    const rows = quotasFiltradas.map(q => [q.socio, q.numeroSocio, q.mes, q.ano, q.valor.toFixed(2), q.estado])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "quotas.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const quotasFiltradas = quotas.filter(quota => {
    const matchSearch = quota.socio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       quota.numeroSocio?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === "todos" || quota.estado === filtroEstado
    const matchMes = filtroMes === "todos" || quota.mes?.toLowerCase() === filtroMes.toLowerCase()
    return matchSearch && matchEstado && matchMes
  })

  const totalRecebido = quotas.filter(q => q.estado === "pago").reduce((sum, q) => sum + q.valor, 0)
  const totalPendente = quotas.filter(q => q.estado === "pendente" || q.estado === "atrasado").reduce((sum, q) => sum + q.valor, 0)
  const quotasPagas = quotas.filter(q => q.estado === "pago").length
  const quotasAtrasadas = quotas.filter(q => q.estado === "atrasado").length

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestao de Quotas</h1>
            <p className="text-muted-foreground">Controle de pagamentos mensais dos socios</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 size-4" />
              Exportar
            </Button>
            <Dialog open={emitirQuotasOpen} onOpenChange={setEmitirQuotasOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 size-4" />
                  Emitir Quotas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Emitir Quotas Mensais</DialogTitle>
                  <DialogDescription>
                    Gerar quotas para todos os socios ativos
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="mesEmissao">Mes</FieldLabel>
                      <Select>
                        <SelectTrigger id="mesEmissao">
                          <SelectValue placeholder="Selecionar mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", 
                            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map(mes => (
                            <SelectItem key={mes} value={mes.toLowerCase()}>{mes}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="anoEmissao">Ano</FieldLabel>
                      <Select>
                        <SelectTrigger id="anoEmissao">
                          <SelectValue placeholder="Selecionar ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 font-medium">Valores por Tipo de Socio</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fundador:</span>
                        <span className="font-medium">{valoresQuota.fundador.toFixed(2)} EUR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Regular:</span>
                        <span className="font-medium">{valoresQuota.regular.toFixed(2)} EUR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jovem:</span>
                        <span className="font-medium">{valoresQuota.jovem.toFixed(2)} EUR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Honorario:</span>
                        <span className="font-medium">Isento</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="notificar" />
                    <Label htmlFor="notificar">Enviar notificacao aos socios</Label>
                  </div>
                </FieldGroup>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEmitirQuotasOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEmitirQuotas} disabled={isGenerating}>
                    {isGenerating ? "A Emitir..." : "Emitir Quotas"}
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
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <Euro className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalRecebido.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">Este periodo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
              <Clock className="size-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{totalPendente.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">A receber</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quotas Pagas</CardTitle>
              <CheckCircle className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotasPagas}</div>
              <p className="text-xs text-muted-foreground">Confirmadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quotas Atrasadas</CardTitle>
              <AlertCircle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{quotasAtrasadas}</div>
              <p className="text-xs text-muted-foreground">Necessitam atencao</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por socio..."
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
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroMes} onValueChange={(value) => setFiltroMes(value ?? "")}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", 
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map(mes => (
                    <SelectItem key={mes} value={mes.toLowerCase()}>{mes}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registo de Quotas</CardTitle>
            <CardDescription>
              {quotasFiltradas.length} quota(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Socio</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Data Pagamento</TableHead>
                  <TableHead className="hidden md:table-cell">Metodo</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotasFiltradas.map((quota) => (
                  <TableRow key={quota.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quota.socio}</div>
                        <div className="text-sm text-muted-foreground">{quota.numeroSocio}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        {quota.mes} {quota.ano}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{quota.valor.toFixed(2)} EUR</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          quota.estado === "pago" ? "secondary" :
                          quota.estado === "pendente" ? "outline" : "destructive"
                        }
                      >
                        {quota.estado === "pago" && <CheckCircle className="mr-1 size-3" />}
                        {quota.estado === "pendente" && <Clock className="mr-1 size-3" />}
                        {quota.estado === "atrasado" && <AlertCircle className="mr-1 size-3" />}
                        {quota.estado.charAt(0).toUpperCase() + quota.estado.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {quota.dataPagamento || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {quota.metodoPagamento || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {quota.estado !== "pago" && (
                        <Button variant="outline" size="sm" onClick={() => { setQuotaSelecionada(quota); setRegistarPagamentoOpen(true) }}>
                          Registar Pagamento
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog externo para registar pagamento */}
      <Dialog open={registarPagamentoOpen} onOpenChange={setRegistarPagamentoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registar Pagamento</DialogTitle>
            <DialogDescription>
              Confirmar pagamento de quota {quotaSelecionada ? `de ${quotaSelecionada.mes} ${quotaSelecionada.ano}` : ""}
            </DialogDescription>
          </DialogHeader>
          {quotaSelecionada && (
            <FieldGroup>
              <div className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-bold">{quotaSelecionada.valor.toFixed(2)} EUR</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Periodo:</span>
                  <span>{quotaSelecionada.mes} {quotaSelecionada.ano}</span>
                </div>
              </div>
              <Field>
                <FieldLabel>Metodo de Pagamento</FieldLabel>
                <Select value={metodoPagamento} onValueChange={(v) => setMetodoPagamento(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar metodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Numerario">Numerario</SelectItem>
                    <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="MBWay">MB Way</SelectItem>
                    <SelectItem value="Multibanco">Multibanco</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Data de Pagamento</FieldLabel>
                <Input type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} />
              </Field>
            </FieldGroup>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistarPagamentoOpen(false)}>Cancelar</Button>
            <Button onClick={() => quotaSelecionada && handleRegistarPagamento(quotaSelecionada)} disabled={isSavingPayment}>
              {isSavingPayment ? "A Guardar..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
