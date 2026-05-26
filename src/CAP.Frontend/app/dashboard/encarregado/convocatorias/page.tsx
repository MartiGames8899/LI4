"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Calendar, MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle, MessageSquare, Car, Bus } from "lucide-react"
import { fetchApi } from "@/lib/api"

export default function ConvocatoriasEncarregadoPage() {
  const router = useRouter()
  const [respostaOpen, setRespostaOpen] = useState(false)
  const [convocatoriaSelecionada, setConvocatoriaSelecionada] = useState<any | null>(null)
  const [resposta, setResposta] = useState<"confirmar" | "recusar" | null>(null)
  const [motivo, setMotivo] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [convocatorias, setConvocatorias] = useState<any[]>([])
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
      const dependentes = data.dependentes || []
      
      let allConvs: any[] = []

      for (const d of dependentes) {
        const d_convs: any[] = await fetchApi<any[]>(`api/sports/convocations/athlete/${d.id}`).catch(() => [])
        
        const mapped = d_convs.map(c => {
           const convite = c.convites.find((cv: any) => cv.atletaId === d.id)
           let estadoStr = "pendente"
           if (convite) {
               if (convite.presenca === 1) estadoStr = "confirmado"
               else if (convite.presenca === 2) estadoStr = "recusado"
           }
           
           const dt = new Date(c.dataEvento)
           return {
               id: c.id,
               atletaId: d.id,
               tipo: c.titulo?.includes("Jogo") ? "Jogo" : "Treino",
               adversario: c.titulo,
               data: dt.toISOString().split("T")[0],
               hora: dt.toTimeString().substring(0, 5),
               local: c.local || "Campo do CAP",
               concentracao: new Date(dt.getTime() - 45*60000).toTimeString().substring(0, 5), // 45 min before
               equipamento: "Principal",
               atleta: d.nome,
               escalao: "Sub-15", // mock
               estado: estadoStr,
               transporte: "proprio",
               observacoes: convite?.observacoes
           }
        })
        allConvs = [...allConvs, ...mapped]
      }

      setConvocatorias(allConvs)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const pendentes = convocatorias.filter(c => c.estado === "pendente")
  const confirmadas = convocatorias.filter(c => c.estado === "confirmado")
  const recusadas = convocatorias.filter(c => c.estado === "recusado")

  const abrirResposta = (conv: any) => {
    setConvocatoriaSelecionada(conv)
    setResposta(null)
    setMotivo("")
    setObservacoes("")
    setRespostaOpen(true)
  }

  const enviarResposta = async () => {
      if (!convocatoriaSelecionada || !resposta) return;
      try {
          const presencaEnum = resposta === "confirmar" ? 1 : 2;
          const obsFinal = resposta === "recusar" ? motivo : observacoes;
          await fetchApi(`api/sports/convocations/${convocatoriaSelecionada.id}/presence`, {
              method: "POST",
              body: JSON.stringify({
                  atletaId: convocatoriaSelecionada.atletaId,
                  presenca: presencaEnum,
                  observacoes: obsFinal
              })
          })
          setRespostaOpen(false)
          fetchData()
      } catch (e) {
          console.error(e)
      }
  }

  if (loading) {
      return <div className="flex h-screen items-center justify-center">A carregar...</div>
  }

  return (
    <DashboardLayout role="encarregado" userName="O Meu Perfil">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">ConvocatÃ³rias</h1>
          <p className="text-muted-foreground">Responda Ã s convocatÃ³rias dos seus educandos</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="size-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendentes.length}</div>
              <p className="text-xs text-muted-foreground">A aguardar resposta</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <CheckCircle className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{confirmadas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recusadas</CardTitle>
              <XCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recusadas.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pendentes">
          <TabsList>
            <TabsTrigger value="pendentes">
              Pendentes
              {pendentes.length > 0 && (
                <Badge className="ml-2 bg-amber-100 text-amber-800">{pendentes.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmadas">Confirmadas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {pendentes.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="mb-4 size-12 text-green-600" />
                    <h3 className="text-lg font-medium">Tudo em dia!</h3>
                    <p className="text-muted-foreground">NÃ£o tem convocatÃ³rias pendentes de resposta</p>
                  </CardContent>
                </Card>
              ) : (
                pendentes.map((conv) => (
                  <ConvocatoriaCard key={`${conv.id}-${conv.atletaId}`} convocatoria={conv} onResponder={() => abrirResposta(conv)} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="confirmadas" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {confirmadas.map((conv) => (
                <ConvocatoriaCard key={`${conv.id}-${conv.atletaId}`} convocatoria={conv} readonly />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="todas" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {convocatorias.map((conv) => (
                <ConvocatoriaCard 
                  key={`${conv.id}-${conv.atletaId}`} 
                  convocatoria={conv} 
                  readonly={conv.estado !== "pendente"}
                  onResponder={conv.estado === "pendente" ? () => abrirResposta(conv) : undefined}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog Resposta */}
        <Dialog open={respostaOpen} onOpenChange={setRespostaOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Responder a ConvocatÃ³ria</DialogTitle>
              <DialogDescription>
                {convocatoriaSelecionada?.tipo} - {convocatoriaSelecionada?.adversario || "Treino"}
              </DialogDescription>
            </DialogHeader>
            {convocatoriaSelecionada && (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {convocatoriaSelecionada.atleta.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{convocatoriaSelecionada.atleta}</p>
                      <p className="text-xs text-muted-foreground">{convocatoriaSelecionada.escalao}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      {new Date(convocatoriaSelecionada.data).toLocaleDateString("pt-PT")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      {convocatoriaSelecionada.hora}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    {convocatoriaSelecionada.local}
                  </div>
                </div>

                <FieldGroup>
                  <Field>
                    <FieldLabel>A sua resposta</FieldLabel>
                    <div className="flex gap-2">
                      <Button
                        variant={resposta === "confirmar" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setResposta("confirmar")}
                      >
                        <CheckCircle className="mr-2 size-4" />
                        Confirmar
                      </Button>
                      <Button
                        variant={resposta === "recusar" ? "destructive" : "outline"}
                        className="flex-1"
                        onClick={() => setResposta("recusar")}
                      >
                        <XCircle className="mr-2 size-4" />
                        Recusar
                      </Button>
                    </div>
                  </Field>

                  {resposta === "confirmar" && (
                    <Field>
                      <FieldLabel>Transporte</FieldLabel>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Car className="mr-2 size-4" />
                          PrÃ³prio
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Bus className="mr-2 size-4" />
                          Clube
                        </Button>
                      </div>
                    </Field>
                  )}

                  {resposta === "recusar" && (
                    <Field>
                      <FieldLabel htmlFor="motivo">Motivo (obrigatÃ³rio)</FieldLabel>
                      <Textarea
                        id="motivo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Indique o motivo da ausÃªncia..."
                        className="min-h-[80px]"
                      />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="obs">ObservaÃ§Ãµes (opcional)</FieldLabel>
                    <Textarea
                      id="obs"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Alguma informaÃ§Ã£o adicional..."
                      className="min-h-[60px]"
                    />
                  </Field>
                </FieldGroup>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRespostaOpen(false)}>
                Cancelar
              </Button>
              <Button disabled={!resposta || (resposta === 'recusar' && !motivo)} onClick={enviarResposta}>
                Enviar Resposta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function ConvocatoriaCard({ 
  convocatoria, 
  readonly = false,
  onResponder 
}: { 
  convocatoria: any
  readonly?: boolean
  onResponder?: () => void
}) {
  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "Jogo": return "default"
      case "Treino": return "secondary"
      case "Torneio": return "outline"
      default: return "secondary"
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendente": return <Badge variant="outline" className="bg-amber-50 text-amber-700">Pendente</Badge>
      case "confirmado": return <Badge variant="secondary" className="bg-green-50 text-green-700">Confirmado</Badge>
      case "recusado": return <Badge variant="destructive">Recusado</Badge>
      default: return null
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant(convocatoria.tipo)}>{convocatoria.tipo}</Badge>
            {getEstadoBadge(convocatoria.estado)}
          </div>
        </div>
        <CardTitle className="text-lg">
          {convocatoria.adversario || "Treino Regular"}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Avatar className="size-5">
            <AvatarFallback className="text-[10px]">
              {convocatoria.atleta.split(" ").map((n: string) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          {convocatoria.atleta} ({convocatoria.escalao})
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span>{new Date(convocatoria.data).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span>ConcentraÃ§Ã£o: {convocatoria.concentracao} | InÃ­cio: {convocatoria.hora}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{convocatoria.local}</span>
          </div>
          {convocatoria.transporte && (
            <div className="flex items-center gap-2">
              {convocatoria.transporte === "clube" ? <Bus className="size-4 text-muted-foreground" /> : <Car className="size-4 text-muted-foreground" />}
              <span>Transporte: {convocatoria.transporte === "clube" ? "Clube" : "PrÃ³prio"}</span>
            </div>
          )}
          {convocatoria.observacoes && (
            <div className="mt-2 rounded bg-muted p-2 text-xs">
              <MessageSquare className="mb-1 size-3" />
              {convocatoria.observacoes}
            </div>
          )}
        </div>
      </CardContent>
      {!readonly && onResponder && (
        <CardFooter>
          <Button className="w-full" onClick={onResponder}>
            Responder
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
