"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  id: number
  nome: string
  numero: number
  presente: boolean | null
  justificacao?: string
}

interface Sessao {
  id: number
  tipo: "treino" | "jogo"
  data: string
  hora: string
  local: string
  atletas: Atleta[]
}

const mockSessoes: Sessao[] = [
  {
    id: 1,
    tipo: "treino",
    data: "2025-01-24",
    hora: "18:30",
    local: "Campo Principal",
    atletas: [
      { id: 1, nome: "Joao Silva", numero: 10, presente: true },
      { id: 2, nome: "Pedro Santos", numero: 7, presente: true },
      { id: 3, nome: "Miguel Costa", numero: 4, presente: false, justificacao: "Lesao" },
      { id: 4, nome: "Tiago Ferreira", numero: 1, presente: true },
      { id: 5, nome: "Andre Oliveira", numero: 9, presente: null },
      { id: 6, nome: "Bruno Martins", numero: 6, presente: true },
      { id: 7, nome: "Carlos Almeida", numero: 3, presente: false },
      { id: 8, nome: "Daniel Sousa", numero: 8, presente: true },
    ],
  },
  {
    id: 2,
    tipo: "treino",
    data: "2025-01-22",
    hora: "18:30",
    local: "Campo Principal",
    atletas: [
      { id: 1, nome: "Joao Silva", numero: 10, presente: true },
      { id: 2, nome: "Pedro Santos", numero: 7, presente: true },
      { id: 3, nome: "Miguel Costa", numero: 4, presente: true },
      { id: 4, nome: "Tiago Ferreira", numero: 1, presente: true },
      { id: 5, nome: "Andre Oliveira", numero: 9, presente: false },
      { id: 6, nome: "Bruno Martins", numero: 6, presente: true },
      { id: 7, nome: "Carlos Almeida", numero: 3, presente: true },
      { id: 8, nome: "Daniel Sousa", numero: 8, presente: false },
    ],
  },
]

export default function PresencasPage() {
  const router = useRouter()
  const [selectedSessao, setSelectedSessao] = useState<Sessao>(mockSessoes[0])
  const [presencas, setPresencas] = useState<Record<number, boolean | null>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "treinador") {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    // Initialize presencas from selected sessao
    const initial: Record<number, boolean | null> = {}
    selectedSessao.atletas.forEach((a) => {
      initial[a.id] = a.presente
    })
    setPresencas(initial)
    setHasChanges(false)
  }, [selectedSessao])

  const handlePresencaChange = (atletaId: number, value: boolean | null) => {
    setPresencas((prev) => ({ ...prev, [atletaId]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Here you would send the presencas to the API
    console.log("Saving presencas:", presencas)
    setHasChanges(false)
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
                  const sessao = mockSessoes.find((s) => s.id.toString() === value)
                  if (sessao) setSelectedSessao(sessao)
                }}
              >
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockSessoes.map((sessao) => (
                    <SelectItem key={sessao.id} value={sessao.id.toString()}>
                      {sessao.tipo === "treino" ? "Treino" : "Jogo"} - {new Date(sessao.data).toLocaleDateString("pt-PT")} ({sessao.hora})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon">
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
                        {atleta.nome.split(" ").map((n) => n[0]).join("")}
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
                  const newPresencas: Record<number, boolean | null> = {}
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
                  const newPresencas: Record<number, boolean | null> = {}
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
      </div>
    </DashboardLayout>
  )
}
