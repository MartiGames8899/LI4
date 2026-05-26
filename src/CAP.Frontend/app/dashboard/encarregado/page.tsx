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
import { fetchApi } from "@/lib/api"

interface User {
  email: string
  role: string
}

export default function DashboardEncarregadoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  
  const [atletas, setAtletas] = useState<any[]>([])
  const [convocatoriasPendentes, setConvocatoriasPendentes] = useState<any[]>([])
  const [pagamentosPendentes, setPagamentosPendentes] = useState<any[]>([])
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
    setUser(parsed)
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data: any = await fetchApi("api/users/parental/dashboard")
      const dependentes = data.dependentes || []
      
      let allAtletas = []
      let allConvs: any[] = []
      let allPags: any[] = []

      for (const d of dependentes) {
        const atestados: any[] = await fetchApi<any[]>(`api/clinical/certificates/athlete/${d.id}`).catch(() => [])
        const quotas: any[] = await fetchApi<any[]>(`api/finance/quotas/athlete/${d.id}`).catch(() => [])
        const convocatorias: any[] = await fetchApi<any[]>(`api/sports/convocations/athlete/${d.id}`).catch(() => [])
        
        const latestAtestado = atestados.length > 0 ? atestados.sort((a, b) => new Date(b.dataExpiracao).getTime() - new Date(a.dataExpiracao).getTime())[0] : null
        const isValid = latestAtestado ? new Date(latestAtestado.dataExpiracao) > new Date() : false
        
        const inDebtQuotas = quotas.filter(q => q.estado !== 2 && new Date(q.dataVencimento) < new Date()) // 2 is Paga
        const pendentesAtleta = quotas.filter(q => q.estado !== 2).map(q => ({
            id: q.id,
            descricao: `Quota Pendente`,
            valor: q.valorTotal - q.valorPago,
            vencimento: q.dataVencimento,
            atleta: d.nome
        }))
        allPags = [...allPags, ...pendentesAtleta]

        const proximaConvocatoria = convocatorias.find(c => new Date(c.dataEvento) > new Date())

        allAtletas.push({
            ...d,
            idade: 12, // mock since not in model
            equipa: "Sem equipa",
            atestadoValido: isValid,
            atestadoExpira: latestAtestado?.dataExpiracao,
            quotasEmDia: inDebtQuotas.length === 0,
            proximaConvocatoria: proximaConvocatoria ? { tipo: "Evento", data: new Date(proximaConvocatoria.dataEvento).toLocaleString("pt-PT") } : null
        })

        const pendingConvs = convocatorias.filter(c => {
           const convite = c.convites.find((cv: any) => cv.atletaId === d.id)
           return convite && convite.presenca === 0 // Pendente
        }).map(c => ({
            id: c.id,
            atletaId: d.id,
            atleta: d.nome,
            evento: c.titulo,
            data: new Date(c.dataEvento).toLocaleString("pt-PT"),
            tipo: "evento"
        }))
        allConvs = [...allConvs, ...pendingConvs]
      }

      setAtletas(allAtletas)
      setPagamentosPendentes(allPags)
      setConvocatoriasPendentes(allConvs)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) {
    return <div className="flex h-screen items-center justify-center">A carregar...</div>
  }

  const totalPendente = pagamentosPendentes.reduce((acc, p) => acc + p.valor, 0)
  const atletasSemAtestado = atletas.filter((a) => !a.atestadoValido).length

  const handleConfirmarConvocatoria = async (id: string, atletaId: string) => {
    try {
       await fetchApi(`api/sports/convocations/${id}/presence`, {
           method: "POST",
           body: JSON.stringify({ atletaId, presenca: 1, observacoes: "" }) // 1 is Confirmado
       })
       fetchDashboardData()
    } catch (error) {
        console.error(error)
    }
  }

  const handleRecusarConvocatoria = async (id: string, atletaId: string) => {
    try {
        await fetchApi(`api/sports/convocations/${id}/presence`, {
            method: "POST",
            body: JSON.stringify({ atletaId, presenca: 2, observacoes: "Recusado pelo encarregado" }) // 2 is Recusado
        })
        fetchDashboardData()
     } catch (error) {
         console.error(error)
     }
  }

  return (
    <DashboardLayout role="encarregado" userName={user.email}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard do Encarregado</h1>
          <p className="text-muted-foreground">Acompanhe as atividades dos seus educandos no CAP.</p>
        </div>

        {/* Alerts */}
        {(atletasSemAtestado > 0 || pagamentosPendentes.length > 0) && (
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

            {pagamentosPendentes.length > 0 && (
              <Card className="border-cap-gold/50 bg-cap-gold/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="size-5 text-cap-gold mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-cap-gold">Pagamentos Pendentes</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tem {pagamentosPendentes.length} pagamento(s) pendente(s) no valor total de {totalPendente} EUR.
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
              <div className="text-2xl font-bold">{atletas.length}</div>
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
              <div className="text-2xl font-bold text-cap-gold">{convocatoriasPendentes.length}</div>
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
              <div className="text-2xl font-bold text-cap-red">{totalPendente.toFixed(2)} EUR</div>
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
                {atletas.filter((a) => a.atestadoValido).length}/{atletas.length}
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
                {atletas.map((atleta) => (
                  <div
                    key={atleta.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {atleta.nome.split(" ").map((n: string) => n[0]).join("")}
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
                {convocatoriasPendentes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="size-8 mx-auto mb-2 text-success" />
                    <p>Todas as convocatorias respondidas!</p>
                  </div>
                ) : (
                  convocatoriasPendentes.map((conv) => (
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
                      <Button size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={() => handleConfirmarConvocatoria(conv.id, conv.atletaId)}>
                        <CheckCircle className="size-4 mr-1" />
                        Confirmar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleRecusarConvocatoria(conv.id, conv.atletaId)}>
                        <XCircle className="size-4 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))
                )}
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
              {pagamentosPendentes.map((pag) => (
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
                    <p className="font-bold text-lg">{pag.valor.toFixed(2)} EUR</p>
                    <p className="text-xs text-muted-foreground">
                      Vence: {new Date(pag.vencimento).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                </div>
              ))}
              {pagamentosPendentes.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="size-8 mx-auto mb-2 text-success" />
                    <p>Sem pagamentos pendentes!</p>
                  </div>
              )}
            </div>
            {pagamentosPendentes.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total em Divida</p>
                    <p className="text-2xl font-bold">{totalPendente.toFixed(2)} EUR</p>
                  </div>
                  <Button onClick={() => router.push("/dashboard/encarregado/pagamentos")}>
                    Pagar Tudo
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
