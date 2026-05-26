"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
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

const mockEstatisticasFallback = {
  presencaMedia: 87,
  totalTreinos: 12,
  totalJogos: 4,
  vitorias: 3,
  empates: 1,
  derrotas: 0,
  golosMarcados: 14,
  golosSofridos: 5,
}

export default function RelatoriosTreinadorPage() {
  const router = useRouter()

  const [stats, setStats] = useState(mockEstatisticasFallback)
  const [relatorios, setRelatorios] = useState([
    { id: 1, titulo: "Relatorio Desportivo Mensal (PDF)", tipo: "mensal", data: new Date().toISOString(), estado: "disponivel", path: "/api/reports/export/pdf?type=desportivo" },
    { id: 2, titulo: "EstatÃ­sticas da Equipa (Excel)", tipo: "estatisticas", data: new Date().toISOString(), estado: "disponivel", path: "/api/reports/export/excel" }
  ])

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "treinador") {
      router.push("/")
    } else {
      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      const sportData = await fetchApi<any[]>('/api/reports/sports').catch(() => [])
      if (sportData && sportData.length > 0) {
        const latest = sportData[0]
        setStats({
          ...stats,
          totalTreinos: latest.totalTreinos || stats.totalTreinos,
          totalJogos: latest.totalJogos || stats.totalJogos,
          vitorias: latest.vitorias || stats.vitorias,
          empates: latest.empates || stats.empates,
          derrotas: latest.derrotas || stats.derrotas,
          golosMarcados: latest.golosMarcados || stats.golosMarcados,
          golosSofridos: latest.golosSofridos || stats.golosSofridos
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleExport = (path: string) => {
    const token = localStorage.getItem("cap_token");
    fetch(`${API_BASE_URL}${path}`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = path.includes('excel') ? 'export_treinador.xlsx' : 'export_treinador.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
      })
      .catch(err => console.error("Erro ao exportar", err));
  }

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
            <p className="text-muted-foreground">Estatisticas e relatorios da equipa</p>
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
            <Button onClick={() => handleExport('/api/reports/export/pdf?type=desportivo')}>
              <Download className="size-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Presenca Media
              </CardTitle>
              <TrendingUp className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{stats.presencaMedia}%</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Treinos Realizados
              </CardTitle>
              <Calendar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTreinos}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jogos
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJogos}</div>
              <p className="text-xs text-success">{stats.vitorias}V {stats.empates}E {stats.derrotas}D</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Golos
              </CardTitle>
              <BarChart3 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.golosMarcados} - {stats.golosSofridos}</div>
              <p className="text-xs text-muted-foreground">Marcados - Sofridos</p>
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
