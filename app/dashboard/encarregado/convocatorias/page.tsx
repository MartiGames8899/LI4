"use client"

import { useState } from "react"
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

const convocatorias = [
  {
    id: 1,
    tipo: "Jogo",
    adversario: "FC Vizela B",
    data: "2024-01-20",
    hora: "15:00",
    local: "Campo Municipal de Polvoreira",
    concentracao: "14:00",
    equipamento: "Principal",
    atleta: "Joao Pedro Silva",
    escalao: "Sub-15",
    estado: "pendente",
    transporte: "proprio",
    observacoes: null
  },
  {
    id: 2,
    tipo: "Treino",
    adversario: null,
    data: "2024-01-18",
    hora: "18:30",
    local: "Campo Municipal de Polvoreira",
    concentracao: "18:15",
    equipamento: "Treino",
    atleta: "Joao Pedro Silva",
    escalao: "Sub-15",
    estado: "confirmado",
    transporte: "proprio",
    observacoes: null
  },
  {
    id: 3,
    tipo: "Jogo",
    adversario: "SC Braga C",
    data: "2024-01-27",
    hora: "10:00",
    local: "Complexo Desportivo de Braga",
    concentracao: "08:30",
    equipamento: "Alternativo",
    atleta: "Joao Pedro Silva",
    escalao: "Sub-15",
    estado: "confirmado",
    transporte: "clube",
    observacoes: "Saida do campo as 08:30"
  },
  {
    id: 4,
    tipo: "Torneio",
    adversario: "Torneio de Inverno",
    data: "2024-02-03",
    hora: "09:00",
    local: "Pavilhao de Guimaraes",
    concentracao: "08:00",
    equipamento: "Principal",
    atleta: "Maria Silva",
    escalao: "Sub-12",
    estado: "pendente",
    transporte: null,
    observacoes: "Torneio durante todo o dia"
  }
]

export default function ConvocatoriasEncarregadoPage() {
  const [respostaOpen, setRespostaOpen] = useState(false)
  const [convocatoriaSelecionada, setConvocatoriaSelecionada] = useState<typeof convocatorias[0] | null>(null)
  const [resposta, setResposta] = useState<"confirmar" | "recusar" | null>(null)

  const pendentes = convocatorias.filter(c => c.estado === "pendente")
  const confirmadas = convocatorias.filter(c => c.estado === "confirmado")
  const recusadas = convocatorias.filter(c => c.estado === "recusado")

  const abrirResposta = (conv: typeof convocatorias[0]) => {
    setConvocatoriaSelecionada(conv)
    setRespostaOpen(true)
  }

  return (
    <DashboardLayout userRole="encarregado" userName="Carlos Silva">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Convocatorias</h1>
          <p className="text-muted-foreground">Responda as convocatorias dos seus educandos</p>
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
                    <p className="text-muted-foreground">Nao tem convocatorias pendentes de resposta</p>
                  </CardContent>
                </Card>
              ) : (
                pendentes.map((conv) => (
                  <ConvocatoriaCard key={conv.id} convocatoria={conv} onResponder={() => abrirResposta(conv)} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="confirmadas" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {confirmadas.map((conv) => (
                <ConvocatoriaCard key={conv.id} convocatoria={conv} readonly />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="todas" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {convocatorias.map((conv) => (
                <ConvocatoriaCard 
                  key={conv.id} 
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
              <DialogTitle>Responder a Convocatoria</DialogTitle>
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
                        {convocatoriaSelecionada.atleta.split(" ").map(n => n[0]).join("")}
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
                          Proprio
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
                      <FieldLabel htmlFor="motivo">Motivo (obrigatorio)</FieldLabel>
                      <Textarea
                        id="motivo"
                        placeholder="Indique o motivo da ausencia..."
                        className="min-h-[80px]"
                      />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="obs">Observacoes (opcional)</FieldLabel>
                    <Textarea
                      id="obs"
                      placeholder="Alguma informacao adicional..."
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
              <Button disabled={!resposta} onClick={() => setRespostaOpen(false)}>
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
  convocatoria: typeof convocatorias[0]
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
              {convocatoria.atleta.split(" ").map(n => n[0]).join("")}
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
            <span>Concentracao: {convocatoria.concentracao} | Inicio: {convocatoria.hora}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{convocatoria.local}</span>
          </div>
          {convocatoria.transporte && (
            <div className="flex items-center gap-2">
              {convocatoria.transporte === "clube" ? <Bus className="size-4 text-muted-foreground" /> : <Car className="size-4 text-muted-foreground" />}
              <span>Transporte: {convocatoria.transporte === "clube" ? "Clube" : "Proprio"}</span>
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
