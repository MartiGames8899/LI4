"use client"

import { useEffect } from "react"
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

const mockQuotas = [
  {
    id: 1,
    atleta: "Joao Silva",
    equipa: "Sub-13",
    mes: "Janeiro",
    ano: 2025,
    valor: 35.0,
    estado: "pago",
    dataPagamento: "2025-01-05",
  },
  {
    id: 2,
    atleta: "Joao Silva",
    equipa: "Sub-13",
    mes: "Fevereiro",
    ano: 2025,
    valor: 35.0,
    estado: "pendente",
    dataPagamento: null,
  },
  {
    id: 3,
    atleta: "Maria Silva",
    equipa: "Sub-11",
    mes: "Janeiro",
    ano: 2025,
    valor: 30.0,
    estado: "pago",
    dataPagamento: "2025-01-08",
  },
  {
    id: 4,
    atleta: "Maria Silva",
    equipa: "Sub-11",
    mes: "Fevereiro",
    ano: 2025,
    valor: 30.0,
    estado: "pendente",
    dataPagamento: null,
  },
]

export default function QuotasEncarregadoPage() {
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "encarregado") {
      router.push("/")
    }
  }, [router])

  const pendentes = mockQuotas.filter((q) => q.estado === "pendente")
  const pagos = mockQuotas.filter((q) => q.estado === "pago")
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

  return (
    <DashboardLayout role="encarregado" userName="Manuel Encarregado">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quotas Mensais</h1>
            <p className="text-muted-foreground">Historico de quotas dos seus educandos</p>
          </div>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Exportar Historico
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
                Valor Mensal
              </CardTitle>
              <Euro className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65.00 EUR</div>
              <p className="text-xs text-muted-foreground">2 atletas</p>
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
                Regularize as quotas pendentes para evitar a suspensao das atividades
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
                          {quota.atleta.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{quota.atleta}</p>
                        <p className="text-sm text-muted-foreground">
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
            <CardTitle>Historico de Quotas</CardTitle>
            <CardDescription>Todas as quotas pagas e pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead className="text-right">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQuotas.map((quota) => (
                  <TableRow key={quota.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {quota.atleta.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{quota.atleta}</p>
                          <p className="text-xs text-muted-foreground">{quota.equipa}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
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
