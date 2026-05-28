"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Euro, TrendingUp, CreditCard, AlertTriangle, Download, FileText, Loader2 } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

import { fetchApi, downloadFile } from "@/lib/api"

interface Quota {
  id: string
  atletaId: string
  valorTotal: number
  valorPago: number
  estado: number
  dataVencimento: string
}

interface Pagamento {
  id: string
  atletaId: string
  valor: number
  metodo: string
  dataPagamento?: string
}

const ESTADO_LABELS: Record<number, string> = {
  0: "Pendente",
  1: "Parcialmente Paga",
  2: "Paga",
  3: "Em Atraso",
}

const ANOS = (() => {
  const ano = new Date().getFullYear()
  return [ano, ano - 1, ano - 2]
})()
const MESES = [
  { v: "todos", l: "Todos" },
  { v: "1", l: "Janeiro" }, { v: "2", l: "Fevereiro" }, { v: "3", l: "Março" },
  { v: "4", l: "Abril" }, { v: "5", l: "Maio" }, { v: "6", l: "Junho" },
  { v: "7", l: "Julho" }, { v: "8", l: "Agosto" }, { v: "9", l: "Setembro" },
  { v: "10", l: "Outubro" }, { v: "11", l: "Novembro" }, { v: "12", l: "Dezembro" },
]

export default function GerenciaFinancasPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [quotas, setQuotas] = useState<Quota[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [ano, setAno] = useState<string>(ANOS[0].toString())
  const [mes, setMes] = useState<string>("todos")
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [q, p] = await Promise.all([
        fetchApi<Quota[]>("/api/finance/quotas").catch(() => [] as Quota[]),
        fetchApi<Pagamento[]>("/api/finance/payments").catch(() => [] as Pagamento[]),
      ])
      setQuotas(q)
      setPagamentos(p)
    } catch (e) {
      console.error("Erro ao carregar dados financeiros", e)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotas = useMemo(() => {
    return quotas.filter(q => {
      if (!q.dataVencimento) return false
      const d = new Date(q.dataVencimento)
      if (d.getFullYear().toString() !== ano) return false
      if (mes !== "todos" && (d.getMonth() + 1).toString() !== mes) return false
      return true
    })
  }, [quotas, ano, mes])

  const filteredPagamentos = useMemo(() => {
    return pagamentos.filter(p => {
      if (!p.dataPagamento) return false
      const d = new Date(p.dataPagamento)
      if (d.getFullYear().toString() !== ano) return false
      if (mes !== "todos" && (d.getMonth() + 1).toString() !== mes) return false
      return true
    })
  }, [pagamentos, ano, mes])

  const totalReceitas = filteredPagamentos.reduce((acc, p) => acc + (p.valor || 0), 0)
  const totalPendente = filteredQuotas
    .filter(q => q.estado !== 2)
    .reduce((acc, q) => acc + (q.valorTotal - q.valorPago), 0)
  const quotasPagas = filteredQuotas.filter(q => q.estado === 2).length
  const taxaCobranca = filteredQuotas.length > 0 ? Math.round((quotasPagas / filteredQuotas.length) * 100) : 0

  const handleExport = async (path: string, id: string) => {
    setDownloading(id)
    try {
      const date = new Date().toISOString().slice(0, 10)
      const filename = path.includes("saft")
        ? `saft_${date}.xml`
        : path.includes("excel")
          ? `financeiro_${date}.xlsx`
          : `financeiro_${date}.pdf`
      await downloadFile(path, filename, (state) => {
        if (state !== "loading") setDownloading(null)
      })
    } catch (err: any) {
      alert(err?.message || "Erro ao exportar")
      setDownloading(null)
    }
  }

  const handleExportCSV = () => {
    if (filteredQuotas.length === 0) { alert("Sem quotas no período selecionado."); return }
    const headers = ["Atleta ID", "Vencimento", "Valor Total", "Valor Pago", "Restante", "Estado"]
    const rows = filteredQuotas.map(q => [
      q.atletaId,
      new Date(q.dataVencimento).toLocaleDateString("pt-PT"),
      q.valorTotal.toFixed(2),
      q.valorPago.toFixed(2),
      (q.valorTotal - q.valorPago).toFixed(2),
      ESTADO_LABELS[q.estado] ?? "—",
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quotas_${ano}_${mes}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Euro className="size-6 text-primary" />
              Resumo Financeiro
            </h1>
            <p className="text-muted-foreground">Visão geral das receitas e quotas do clube.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={ano} onValueChange={(v) => setAno(v ?? ANOS[0].toString())}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANOS.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={mes} onValueChange={(v) => setMes(v ?? "todos")}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESES.map(m => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportCSV}>
              <FileText className="size-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("/api/reports/export/excel", "excel")}
              disabled={downloading === "excel"}
            >
              {downloading === "excel" ? <Loader2 className="size-4 mr-2 animate-spin" /> : <FileText className="size-4 mr-2" />}
              Excel
            </Button>
            <Button
              onClick={() => handleExport("/api/reports/export/pdf?type=financeiro", "pdf")}
              disabled={downloading === "pdf"}
            >
              {downloading === "pdf" ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Download className="size-4 mr-2" />}
              PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Recebido</CardTitle>
              <TrendingUp className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{totalReceitas.toFixed(2)} €</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor Pendente</CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totalPendente.toFixed(2)} €</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pagamentos</CardTitle>
              <CreditCard className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPagamentos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Cobrança</CardTitle>
              <Euro className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{taxaCobranca}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quotas no Período</CardTitle>
            <CardDescription>
              {filteredQuotas.length} quotas {mes === "todos" ? `em ${ano}` : `em ${MESES.find(m => m.v === mes)?.l} ${ano}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar dados...</p>
            ) : filteredQuotas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Sem quotas no período selecionado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotas.slice(0, 50).map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.valorTotal?.toFixed(2)} €</TableCell>
                      <TableCell>{q.valorPago?.toFixed(2)} €</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {q.dataVencimento ? new Date(q.dataVencimento).toLocaleDateString("pt-PT") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={q.estado === 2 ? "secondary" : q.estado === 0 ? "outline" : "destructive"}>
                          {ESTADO_LABELS[q.estado] ?? "Desconhecido"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Recebidos</CardTitle>
            <CardDescription>{filteredPagamentos.length} pagamentos no período</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar dados...</p>
            ) : filteredPagamentos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Sem pagamentos no período selecionado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPagamentos.slice(0, 50).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString("pt-PT") : "—"}
                      </TableCell>
                      <TableCell className="font-medium text-success">{p.valor?.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.metodo ?? "—"}</Badge>
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
