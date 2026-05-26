"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Atleta {
  id: string
  nome: string
  numero: number
  presente: boolean | null
  justificacao?: string
}

interface Sessao {
  id: string
  tipo: "treino" | "jogo"
  data: string
  hora: string
  local: string
  atletas: Atleta[]
}

export default function PresencasPage() {
  const router = useRouter()
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [selectedSessao, setSelectedSessao] = useState<Sessao | null>(null)
  const [sessaoIndex, setSessaoIndex] = useState(0)
  const [presencas, setPresencas] = useState<Record<string, boolean | null>>({})
  const [justificacoes, setJustificacoes] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      loadData()
    }
  }, [router])

  const loadData = async () => {
    try {
      const [treinosRes, athletesRes] = await Promise.all([
        fetchApi<any>("/api/sports/trainings"),
        fetchApi<any>("/api/users/athletes")
      ])

      const treinos = treinosRes.data || []
      const athletes = athletesRes.data || []

      const athletesMap = athletes.reduce((acc: any, a: any) => {
        acc[a.id] = a
        return acc
      }, {})

      const mappedSessoes: Sessao[] = treinos.map((t: any) => ({
        id: t.id,
        tipo: "treino",
        data: t.dataInicio.split("T")[0],
        hora: t.dataInicio.split("T")[1].substring(0, 5),
        local: "EspaÃ§o " + t.espacoId, // Just a placeholder, would normally fetch the space
        atletas: t.presencas.map((p: any) => {
          const athleteInfo = athletesMap[p.atletaId] || { nome: "Desconhecido", numero: 0 }
          return {
            id: p.atletaId,
            nome: athleteInfo.nome,
            numero: athleteInfo.numero,
            presente: p.estado === 1 ? true : p.estado === 2 || p.estado === 3 || p.estado === 4 ? false : null,
            justificacao: p.justificacao
          }
        })
      }))

      setSessoes(mappedSessoes)
      if (mappedSessoes.length > 0) {
        setSelectedSessao(mappedSessoes[0])
        setSessaoIndex(0)
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedSessao) {
      const initial: Record<string, boolean | null> = {}
      const initialJusts: Record<string, string> = {}
      selectedSessao.atletas.forEach((a) => {
        initial[a.id] = a.presente
        initialJusts[a.id] = a.justificacao || ""
      })
      setPresencas(initial)
      setJustificacoes(initialJusts)
      setHasChanges(false)
    }
  }, [selectedSessao])

  const handlePresencaChange = (atletaId: string, value: boolean | null) => {
    setPresencas((prev) => ({ ...prev, [atletaId]: value }))
    setHasChanges(true)
  }

  const handlePrevSessao = () => {
    if (sessaoIndex < sessoes.length - 1) {
      const newIndex = sessaoIndex + 1
      setSessaoIndex(newIndex)
      setSelectedSessao(sessoes[newIndex])
    }
  }

  const handleNextSessao = () => {
    if (sessaoIndex > 0) {
      const newIndex = sessaoIndex - 1
      setSessaoIndex(newIndex)
      setSelectedSessao(sessoes[newIndex])
    }
  }

  const handleSave = async () => {
    if (!selectedSessao) return
    
    // Convert to UpdatePresencaRequest payload
    // EstadoPresencaTreino: 0: Pendente, 1: Presente, 2: FaltaJustificada, 3: FaltaInjustificada, 4: AusentePorLesao
    const payload = Object.entries(presencas).map(([atletaId, presente]) => {
      let estado = 0;
      if (presente === true) estado = 1;
      else if (presente === false) estado = justificacoes[atletaId] ? 2 : 3;

      return {
        atletaId,
        estado,
        justificacao: justificacoes[atletaId] || ""
      }
    });

    try {
      await fetchApi(`/api/sports/trainings/${selectedSessao.id}/attendance`, {
        method: "POST",
        body: JSON.stringify(payload)
      })
      setHasChanges(false)
      // refresh data to sync states
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const stats = {
    presentes: Object.values(presencas).filter((p) => p === true).length,
    ausentes: Object.values(presencas).filter((p) => p === false).length,
    pendentes: Object.values(presencas).filter((p) => p === null).length,
  }

  const taxaPresenca = stats.presentes + stats.ausentes > 0
    ? Math.round((stats.presentes / (stats.presentes + stats.ausentes)) * 100)
    : 0

  return (
    <DashboardLayout role="treinador" userName="Carlos Treinador">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Registo de Presencas</h1>
            <p className="text-muted-foreground">Registe as presencas dos atletas em treinos e jogos</p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="size-4 mr-2" />
            Guardar Alteracoes
          </Button>
        </div>

        {/* Session Selector */}
        {!isLoading && sessoes.length === 0 ? (
          <p>NÃ£o hÃ¡ sessÃµes de treino disponÃ­veis.</p>
        ) : selectedSessao ? (
          <>
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Selecionar Sessao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Select
                value={selectedSessao.id.toString()}
                onValueChange={(value) => {
                  const sessao = sessoes.find((s) => s.id.toString() === value)
                  if (sessao) {
                    const index = sessoes.findIndex(s => s.id.toString() === value)
                    setSessaoIndex(index)
                    setSelectedSessao(sessao)
                  }
                }}
              >
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessoes.map((sessao) => (
                    <SelectItem key={sessao.id} value={sessao.id.toString()}>
                      {sessao.tipo === "treino" ? "Treino" : "Jogo"} - {new Date(sessao.data).toLocaleDateString("pt-PT")} ({sessao.hora})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevSessao} disabled={sessaoIndex >= sessoes.length - 1}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextSessao} disabled={sessaoIndex <= 0}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="flex-1" />

              <Badge variant={selectedSessao.tipo === "treino" ? "secondary" : "destructive"} className="w-fit">
                {selectedSessao.tipo === "treino" ? "Treino" : "Jogo"}
              </Badge>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-secondary/30">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Data:</span>{" "}
                  <span className="font-medium">{new Date(selectedSessao.data).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Hora:</span>{" "}
                  <span className="font-medium">{selectedSessao.hora}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Local:</span>{" "}
                  <span className="font-medium">{selectedSessao.local}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{selectedSessao.atletas.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Convocados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-success" />
                <span className="text-2xl font-bold text-success">{stats.presentes}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Presentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{stats.ausentes}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ausentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-cap-gold" />
                <span className="text-2xl font-bold text-cap-gold">{taxaPresenca}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Taxa de Presenca</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atletas</CardTitle>
            <CardDescription>
              Marque a presenca de cada atleta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedSessao.atletas.map((atleta) => (
                <div
                  key={atleta.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    presencas[atleta.id] === true
                      ? "bg-success/5 border-success/30"
                      : presencas[atleta.id] === false
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-secondary/30 border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {atleta.nome.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{atleta.nome}</p>
                      <p className="text-sm text-muted-foreground">#{atleta.numero}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {atleta.justificacao && (
                      <Badge variant="outline" className="text-muted-foreground">
                        {atleta.justificacao}
                      </Badge>
                    )}

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`presente-${atleta.id}`}
                          checked={presencas[atleta.id] === true}
                          onCheckedChange={(checked) => {
                            handlePresencaChange(atleta.id, checked ? true : null)
                          }}
                          className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                        />
                        <Label htmlFor={`presente-${atleta.id}`} className="text-sm text-success cursor-pointer">
                          Presente
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`ausente-${atleta.id}`}
                          checked={presencas[atleta.id] === false}
                          onCheckedChange={(checked) => {
                            handlePresencaChange(atleta.id, checked ? false : null)
                          }}
                          className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                        />
                        <Label htmlFor={`ausente-${atleta.id}`} className="text-sm text-destructive cursor-pointer">
                          Ausente
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  const newPresencas: Record<string, boolean | null> = {}
                  selectedSessao.atletas.forEach((a) => {
                    newPresencas[a.id] = true
                  })
                  setPresencas(newPresencas)
                  setHasChanges(true)
                }}
              >
                <CheckCircle className="size-4 mr-2" />
                Marcar Todos Presentes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const newPresencas: Record<string, boolean | null> = {}
                  selectedSessao.atletas.forEach((a) => {
                    newPresencas[a.id] = null
                  })
                  setPresencas(newPresencas)
                  setHasChanges(true)
                }}
              >
                <Clock className="size-4 mr-2" />
                Limpar Todas
              </Button>
            </div>
          </CardContent>
        </Card>
        </>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
