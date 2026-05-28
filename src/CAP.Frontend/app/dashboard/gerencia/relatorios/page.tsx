"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Download, FileText, TrendingUp, Users, Euro, CheckCircle, Loader2 } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { fetchApi, downloadFile } from "@/lib/api"

const mockStats = {
  totalSocios: 0,
  sociosAtivos: 0,
  novosSociosMes: 0,
  quotasRecebidas: 0,
  quotasPendentes: 0,
  taxaCobranca: 0,
}

export default function GerenciaRelatoriosPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [stats, setStats] = useState(mockStats)
  const [downloadingId, setDownloadingId] = useState<number | string | null>(null)

  const relatorios = [
    { id: 1, titulo: "Relatório Financeiro PDF", tipo: "financeiro", data: new Date().toISOString(), path: "/api/reports/export/pdf?type=financeiro" },
    { id: 2, titulo: "Relatório Financeiro Excel", tipo: "financeiro", data: new Date().toISOString(), path: "/api/reports/export/excel" },
    { id: 3, titulo: "Ficheiro SAF-T (Contabilidade)", tipo: "saft", data: new Date().toISOString(), path: "/api/reports/export/saft" },
    { id: 4, titulo: "Relatório Global Geral PDF", tipo: "geral", data: new Date().toISOString(), path: "/api/reports/export/pdf?type=geral" },
  ]

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const [socios, quotas] = await Promise.all([
        fetchApi<any[]>("/api/users/socios").catch(() => [] as any[]),
        fetchApi<any[]>("/api/finance/quotas").catch(() => [] as any[]),
      ])
      const ativos = socios.filter((s: any) => s.estado?.toLowerCase() === "ativo").length
      const pagas = quotas.filter((q: any) => q.estado === 2)
      const pendentes = quotas.filter((q: any) => q.estado !== 2)
      const totalRecebido = pagas.reduce((acc: number, q: any) => acc + (q.valorPago || 0), 0)
      const totalPendente = pendentes.reduce((acc: number, q: any) => acc + (q.valorTotal - q.valorPago), 0)
      setStats({
        totalSocios: socios.length,
        sociosAtivos: ativos,
        novosSociosMes: 0,
        quotasRecebidas: totalRecebido,
        quotasPendentes: totalPendente,
        taxaCobranca: quotas.length > 0 ? Math.round((pagas.length / quotas.length) * 100) : 0,
      })
    } catch (e) {
      console.error("Erro ao carregar estatísticas", e)
    }
  }

  const handleExport = async (path: string, id: number | string) => {
    try {
      const date = new Date().toISOString().slice(0, 10)
      const filename = path.includes("saft")
        ? `saft_${date}.xml`
        : path.includes("excel")
          ? `relatorio_financeiro_${date}.xlsx`
          : path.includes("type=geral")
            ? `relatorio_geral_${date}.pdf`
            : `relatorio_financeiro_${date}.pdf`
      await downloadFile(path, filename, (state) => {
        if (state === "loading") setDownloadingId(id)
        else setDownloadingId(null)
      })
    } catch (err: any) {
      console.error("Erro ao exportar", err)
      alert(err?.message || "Não foi possível transferir o relatório.")
    }
  }

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="size-6 text-primary" />
              Relatórios Globais
            </h1>
            <p className="text-muted-foreground">Estatísticas e exportações de dados do clube.</p>
          </div>
          <Button onClick={() => handleExport("/api/reports/export/pdf?type=geral", "global")} disabled={downloadingId === "global"}>
            {downloadingId === "global" ? (
              <><Loader2 className="size-4 mr-2 animate-spin" />A exportar...</>
            ) : (
              <><Download className="size-4 mr-2" />Exportar Geral</>
            )}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Sócios</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSocios}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.sociosAtivos} ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quotas Recebidas</CardTitle>
              <Euro className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.quotasRecebidas.toFixed(2)} €</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Cobrança</CardTitle>
              <TrendingUp className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{stats.taxaCobranca}%</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.quotasPendentes.toFixed(2)} € pendente</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Exportações Disponíveis
            </CardTitle>
            <CardDescription>Transfira relatórios em vários formatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatorios.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{r.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Gerado em {new Date(r.data).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      <CheckCircle className="size-3 mr-1" />
                      Disponível
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={downloadingId === r.id}
                      onClick={() => handleExport(r.path, r.id)}
                    >
                      {downloadingId === r.id ? (
                        <><Loader2 className="size-4 mr-1 animate-spin" />A transferir...</>
                      ) : (
                        <><Download className="size-4 mr-1" />Download</>
                      )}
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
