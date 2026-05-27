"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Euro, TrendingUp, CreditCard, AlertTriangle } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { fetchApi } from "@/lib/api"

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

export default function GerenciaFinancasPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [quotas, setQuotas] = useState<Quota[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)

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

  const totalReceitas = pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0)
  const totalPendente = quotas
    .filter(q => q.estado !== 2)
    .reduce((acc, q) => acc + (q.valorTotal - q.valorPago), 0)
  const quotasPagas = quotas.filter(q => q.estado === 2).length
  const taxaCobranca = quotas.length > 0 ? Math.round((quotasPagas / quotas.length) * 100) : 0

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Euro className="size-6 text-primary" />
            Resumo Financeiro
          </h1>
          <p className="text-muted-foreground">Visão geral das receitas e quotas do clube.</p>
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
              <div className="text-2xl font-bold">{pagamentos.length}</div>
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
            <CardTitle>Quotas Registadas</CardTitle>
            <CardDescription>{quotas.length} quotas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar dados...</p>
            ) : quotas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Sem quotas registadas.</p>
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
                  {quotas.slice(0, 20).map((q) => (
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
            <CardTitle>Pagamentos Recentes</CardTitle>
            <CardDescription>{pagamentos.length} pagamentos registados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar dados...</p>
            ) : pagamentos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Sem pagamentos registados.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentos.slice(0, 20).map((p) => (
                    <TableRow key={p.id}>
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
