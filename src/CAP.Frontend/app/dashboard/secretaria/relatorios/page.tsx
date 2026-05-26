"use client"

import { useEffect, useState } from "react"
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

import { fetchApi, API_BASE_URL } from "@/lib/api"

// Mocks to fallback if API doesn't return data (since reports usually run on end of month)
const mockEstatisticasFallback = {
  totalSocios: 156,
  sociosAtivos: 142,
  novosSociosMes: 8,
  quotasRecebidas: 2450,
  quotasPendentes: 350,
  taxaCobranca: 87,
}

export default function RelatoriosSecretariaPage() {
  const router = useRouter()

  const [stats, setStats] = useState(mockEstatisticasFallback)
  const [relatorios, setRelatorios] = useState([
    { id: 1, titulo: "Relatorio Financeiro PDF", tipo: "financeiro", data: new Date().toISOString(), estado: "disponivel", path: "/api/reports/export/pdf?type=financeiro" },
    { id: 2, titulo: "Relatorio Financeiro Excel", tipo: "financeiro", data: new Date().toISOString(), estado: "disponivel", path: "/api/reports/export/excel" },
    { id: 3, titulo: "Ficheiro SAF-T (Contabilidade)", tipo: "saft", data: new Date().toISOString(), estado: "disponivel", path: "/api/reports/export/saft" },
  ])

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
      // In a real scenario we could fetch from api/reports/financial
      // For now we use the fallback as baseline and update with real users/quotas data if we want.
      // But let's just use the fallback for dashboard visual structure if no real summaries are found.
      const financerData = await fetchApi<any[]>('/api/reports/financial').catch(() => [])
      if (financerData && financerData.length > 0) {
        // If there's data from backend, map it
        const latest = financerData[0]
        setStats({
          ...stats,
          quotasRecebidas: latest.totalReceitas || stats.quotasRecebidas,
          quotasPendentes: latest.totalDespesas || stats.quotasPendentes // just an example mapping
        })
      }
    } catch (e) {
      console.error("Error loading stats", e)
    }
  }

  const handleExport = (path: string) => {
    // In a real app we might want to attach JWT to headers via fetch, then create a blob.
    // For simplicity, if the API doesn't strictly check tokens for GET export or if we pass it via query, we could do window.open.
    // Assuming we do it securely:
    const token = localStorage.getItem("cap_token");
    fetch(`${API_BASE_URL}${path}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = path.includes('saft') ? 'export.xml' : path.includes('excel') ? 'export.xlsx' : 'export.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(err => console.error("Erro ao exportar", err));
  }

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
            <Button onClick={() => handleExport('/api/reports/export/pdf?type=geral')}>
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
              <div className="text-2xl font-bold">{stats.totalSocios}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <TrendingUp className="size-3 mr-1" />
                +{stats.novosSociosMes} este mes
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
              <div className="text-2xl font-bold text-success">{stats.sociosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.sociosAtivos / stats.totalSocios) * 100)}% do total
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
              <div className="text-2xl font-bold text-success">{stats.quotasRecebidas} EUR</div>
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
              <div className="text-2xl font-bold text-cap-gold">{stats.taxaCobranca}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.quotasPendentes} EUR pendente
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
              {relatorios.map((relatorio) => (
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
                      onClick={() => handleExport(relatorio.path)}
                    >
                      <Download className="size-4 mr-1" />
                      Download
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
