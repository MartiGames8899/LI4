"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Calendar,
  CreditCard,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Bell,
  Heart,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface User {
  email: string
  role: string
}

const mockAtletas = [
  {
    id: 1,
    nome: "Joao Silva",
    idade: 12,
    equipa: "Sub-13",
    atestadoValido: true,
    atestadoExpira: "2025-06-15",
    quotasEmDia: true,
    proximaConvocatoria: { tipo: "Jogo", data: "Sabado, 15:00" },
  },
  {
    id: 2,
    nome: "Maria Silva",
    idade: 10,
    equipa: "Sub-11",
    atestadoValido: false,
    quotasEmDia: false,
    proximaConvocatoria: { tipo: "Treino", data: "Segunda, 18:30" },
  },
]

const mockConvocatoriasPendentes = [
  { id: 1, atleta: "Joao Silva", evento: "Jogo vs FC Exemplo", data: "Sabado, 15:00", tipo: "jogo" },
  { id: 2, atleta: "Maria Silva", evento: "Treino Especial", data: "Domingo, 10:00", tipo: "treino" },
]

const mockPagamentosPendentes = [
  { id: 1, descricao: "Quota Mensal - Janeiro", valor: 25, vencimento: "2025-01-31", atleta: "Joao Silva" },
  { id: 2, descricao: "Quota Mensal - Janeiro", valor: 25, vencimento: "2025-01-31", atleta: "Maria Silva" },
  { id: 3, descricao: "Equipamento Oficial", valor: 45, vencimento: "2025-02-15", atleta: "Joao Silva" },
]

export default function DashboardEncarregadoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

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
    setUser(parsed)
  }, [router])

  if (!user) {
    return null
  }

  const totalPendente = mockPagamentosPendentes.reduce((acc, p) => acc + p.valor, 0)
  const atletasSemAtestado = mockAtletas.filter((a) => !a.atestadoValido).length

  return (
    <DashboardLayout role="encarregado" userName="Manuel Encarregado">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard do Encarregado</h1>
          <p className="text-muted-foreground">Acompanhe as atividades dos seus educandos no CAP.</p>
        </div>

        {/* Alerts */}
        {(atletasSemAtestado > 0 || mockPagamentosPendentes.length > 0) && (
          <div className="space-y-3">
            {atletasSemAtestado > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Atestado(s) em Falta</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {atletasSemAtestado} atleta(s) sem atestado medico valido. Os atletas nao poderao participar em atividades oficiais.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/encarregado/atestados")}>
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {mockPagamentosPendentes.length > 0 && (
              <Card className="border-cap-gold/50 bg-cap-gold/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="size-5 text-cap-gold mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-cap-gold">Pagamentos Pendentes</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tem {mockPagamentosPendentes.length} pagamento(s) pendente(s) no valor total de {totalPendente}EUR.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/encarregado/pagamentos")}>
                      Pagar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meus Atletas
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAtletas.length}</div>
              <p className="text-xs text-muted-foreground">Educandos registados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Convocatorias
              </CardTitle>
              <ClipboardList className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{mockConvocatoriasPendentes.length}</div>
              <p className="text-xs text-muted-foreground">Pendentes de resposta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagamentos
              </CardTitle>
              <CreditCard className="size-4 text-cap-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-red">{totalPendente}EUR</div>
              <p className="text-xs text-muted-foreground">Valor em divida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atestados
              </CardTitle>
              <Heart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAtletas.filter((a) => a.atestadoValido).length}/{mockAtletas.length}
              </div>
              <p className="text-xs text-muted-foreground">Validos</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Meus Atletas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Meus Atletas
              </CardTitle>
              <CardDescription>Resumo dos seus educandos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAtletas.map((atleta) => (
                  <div
                    key={atleta.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {atleta.nome.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{atleta.nome}</p>
                        <p className="text-sm text-muted-foreground">{atleta.equipa} - {atleta.idade} anos</p>
                        <div className="flex gap-2 mt-1">
                          {atleta.atestadoValido ? (
                            <Badge variant="outline" className="text-xs text-success border-success/30">
                              <CheckCircle className="size-3 mr-1" />
                              Atestado OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="size-3 mr-1" />
                              Sem Atestado
                            </Badge>
                          )}
                          {atleta.quotasEmDia ? (
                            <Badge variant="outline" className="text-xs text-success border-success/30">
                              <CreditCard className="size-3 mr-1" />
                              Quotas OK
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-cap-gold/10 text-cap-gold border-cap-gold/20">
                              <Clock className="size-3 mr-1" />
                              Quotas Pendentes
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {atleta.proximaConvocatoria && (
                      <div className="text-right">
                        <Badge variant={atleta.proximaConvocatoria.tipo === "Jogo" ? "destructive" : "secondary"}>
                          {atleta.proximaConvocatoria.tipo}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{atleta.proximaConvocatoria.data}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/encarregado/atletas")}>
                Ver Todos os Atletas
              </Button>
            </CardContent>
          </Card>

          {/* Convocatorias Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" />
                Convocatorias Pendentes
              </CardTitle>
              <CardDescription>Responda as convocatorias dos seus atletas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockConvocatoriasPendentes.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={conv.tipo === "jogo" ? "destructive" : "secondary"}>
                        {conv.tipo === "jogo" ? "Jogo" : "Treino"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{conv.data}</span>
                    </div>
                    <p className="font-medium text-sm mb-1">{conv.evento}</p>
                    <p className="text-xs text-muted-foreground mb-3">Atleta: {conv.atleta}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-success hover:bg-success/90">
                        <CheckCircle className="size-4 mr-1" />
                        Confirmar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                        <XCircle className="size-4 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/dashboard/encarregado/convocatorias")}>
                Ver Todas as Convocatorias
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pagamentos Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Pagamentos Pendentes
            </CardTitle>
            <CardDescription>Quotas e outros pagamentos por regularizar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPagamentosPendentes.map((pag) => (
                <div
                  key={pag.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-cap-gold/10 flex items-center justify-center">
                      <CreditCard className="size-5 text-cap-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pag.descricao}</p>
                      <p className="text-xs text-muted-foreground">Atleta: {pag.atleta}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{pag.valor}EUR</p>
                    <p className="text-xs text-muted-foreground">
                      Vence: {new Date(pag.vencimento).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total em Divida</p>
                <p className="text-2xl font-bold">{totalPendente}EUR</p>
              </div>
              <Button onClick={() => router.push("/dashboard/encarregado/pagamentos")}>
                Pagar Tudo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
