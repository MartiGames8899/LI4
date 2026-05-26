"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CreditCard,
  Euro,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { fetchApi } from "@/lib/api"

export default function QuotasEncarregadoPage() {
  const router = useRouter()
  const [quotas, setQuotas] = useState<any[]>([])
  const [dependentes, setDependentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "encarregado") {
      router.push("/")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data: any = await fetchApi("api/users/parental/dashboard")
      const deps = data.dependentes || []
      setDependentes(deps)
      
      let allQuotas: any[] = []

      for (const d of deps) {
        const d_quotas: any[] = await fetchApi<any[]>(`api/finance/quotas/athlete/${d.id}`).catch(() => [])
        
        const mapped = d_quotas.map(q => {
            const dt = new Date(q.dataVencimento)
            const isLate = q.estado !== 2 && dt < new Date()
            
            return {
                id: q.id,
                atleta: d.nome,
                equipa: "Sem equipa",
                mes: dt.toLocaleString('pt-PT', { month: 'long' }),
                ano: dt.getFullYear(),
                valor: q.valorTotal,
                estado: q.estado === 2 ? "pago" : (isLate ? "atrasado" : "pendente"),
                dataPagamento: q.estado === 2 ? new Date().toISOString() : null, // mock dataPagamento
            }
        })
        allQuotas = [...allQuotas, ...mapped]
      }

      setQuotas(allQuotas)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const pendentes = quotas.filter((q) => q.estado === "pendente" || q.estado === "atrasado")
  const pagos = quotas.filter((q) => q.estado === "pago")
  const totalPendente = pendentes.reduce((sum, q) => sum + q.valor, 0)
  const totalPago = pagos.reduce((sum, q) => sum + q.valor, 0)

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

  if (loading) {
      return <div className="flex h-screen items-center justify-center">A carregar...</div>
  }

  return (
    <DashboardLayout role="encarregado" userName="O Meu Perfil">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quotas Mensais</h1>
            <p className="text-muted-foreground">HistÃ³rico de quotas dos seus educandos</p>
          </div>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Exportar HistÃ³rico
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pendente
              </CardTitle>
              <Clock className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{totalPendente.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">{pendentes.length} quota(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pago
              </CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{totalPago.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">{pagos.length} quota(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atletas Inscritos
              </CardTitle>
              <Euro className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dependentes.length}</div>
              <p className="text-xs text-muted-foreground">Educandos</p>
            </CardContent>
          </Card>
        </div>

        {pendentes.length > 0 && (
          <Card className="border-cap-gold/50 bg-cap-gold/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cap-gold">
                <AlertCircle className="size-5" />
                Quotas Pendentes
              </CardTitle>
              <CardDescription>
                Regularize as quotas pendentes para evitar a suspensÃ£o das atividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendentes.map((quota) => (
                  <div
                    key={quota.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {quota.atleta.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{quota.atleta}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {quota.mes} {quota.ano} - {quota.equipa}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">{quota.valor.toFixed(2)} EUR</span>
                      <Button onClick={() => router.push("/dashboard/encarregado/pagamentos")}>
                        Pagar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>HistÃ³rico de Quotas</CardTitle>
            <CardDescription>Todas as quotas pagas e pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>PerÃ­odo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead className="text-right">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotas.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Sem histÃ³rico de quotas.</TableCell>
                    </TableRow>
                )}
                {quotas.map((quota) => (
                  <TableRow key={quota.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {quota.atleta.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{quota.atleta}</p>
                          <p className="text-xs text-muted-foreground">{quota.equipa}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 capitalize">
                        <Calendar className="size-4 text-muted-foreground" />
                        {quota.mes} {quota.ano}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{quota.valor.toFixed(2)} EUR</TableCell>
                    <TableCell>{getEstadoBadge(quota.estado)}</TableCell>
                    <TableCell>
                      {quota.dataPagamento
                        ? new Date(quota.dataPagamento).toLocaleDateString("pt-PT")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {quota.estado === "pago" && (
                        <Button variant="ghost" size="sm">
                          <Download className="size-4" />
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
    </DashboardLayout>
  )
}
