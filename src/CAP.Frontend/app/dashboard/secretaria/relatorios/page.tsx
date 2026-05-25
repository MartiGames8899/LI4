"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  Euro,
  CheckCircle,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const mockRelatorios = [
  { id: 1, titulo: "Relatorio Financeiro - Janeiro 2025", tipo: "financeiro", data: "2025-01-31", estado: "disponivel" },
  { id: 2, titulo: "Relatorio de Socios - Janeiro 2025", tipo: "socios", data: "2025-01-31", estado: "disponivel" },
  { id: 3, titulo: "Relatorio de Quotas - Janeiro 2025", tipo: "quotas", data: "2025-01-31", estado: "pendente" },
  { id: 4, titulo: "Relatorio Financeiro - Dezembro 2024", tipo: "financeiro", data: "2024-12-31", estado: "disponivel" },
  { id: 5, titulo: "Relatorio Anual 2024", tipo: "anual", data: "2024-12-31", estado: "disponivel" },
]

const mockEstatisticas = {
  totalSocios: 156,
  sociosAtivos: 142,
  novosSociosMes: 8,
  quotasRecebidas: 2450,
  quotasPendentes: 350,
  taxaCobranca: 87,
}

export default function RelatoriosSecretariaPage() {
  const router = useRouter()

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

  return (
    <DashboardLayout role="secretaria" userName="Ana Secretaria">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
            <p className="text-muted-foreground">Estatisticas e relatorios administrativos</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="janeiro">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="janeiro">Janeiro 2025</SelectItem>
                <SelectItem value="dezembro">Dezembro 2024</SelectItem>
                <SelectItem value="novembro">Novembro 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="size-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Socios
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockEstatisticas.totalSocios}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <TrendingUp className="size-3 mr-1" />
                +{mockEstatisticas.novosSociosMes} este mes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Socios Ativos
              </CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{mockEstatisticas.sociosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((mockEstatisticas.sociosAtivos / mockEstatisticas.totalSocios) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quotas Recebidas
              </CardTitle>
              <Euro className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{mockEstatisticas.quotasRecebidas} EUR</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Cobranca
              </CardTitle>
              <BarChart3 className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{mockEstatisticas.taxaCobranca}%</div>
              <p className="text-xs text-muted-foreground">
                {mockEstatisticas.quotasPendentes} EUR pendente
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Relatorios Disponiveis
            </CardTitle>
            <CardDescription>Descarregue os relatorios gerados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRelatorios.map((relatorio) => (
                <div
                  key={relatorio.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{relatorio.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Gerado em {new Date(relatorio.data).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={relatorio.estado === "disponivel" ? "secondary" : "outline"}>
                      {relatorio.estado === "disponivel" ? (
                        <>
                          <CheckCircle className="size-3 mr-1" />
                          Disponivel
                        </>
                      ) : (
                        "A processar"
                      )}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={relatorio.estado !== "disponivel"}
                    >
                      <Download className="size-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
