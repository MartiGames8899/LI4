"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  CheckCircle2,
  Clock,
  Send,
  User,
  CheckCheck
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { fetchApi } from "@/lib/api"

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  dataCriacao: string;
  lida: boolean;
  tipo: string;
}

export default function NotificacoesUniversalPage() {
  const router = useRouter()

  
  const [user, setUser] = useState<any>(null)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  // Nova Mensagem
  const [novaMsgOpen, setNovaMsgOpen] = useState(false)
  const [msgTitulo, setMsgTitulo] = useState("")
  const [msgCorpo, setMsgCorpo] = useState("")
  const [msgDestino, setMsgDestino] = useState("")
  const [destinatariosPossiveis, setDestinatariosPossiveis] = useState<any[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    setUser(parsed)
    fetchInbox()
    
    // Se for staff, carregar a lista de utilizadores para poder mandar mensagens
    if (["treinador", "secretaria", "gerencia"].includes(parsed.role)) {
      fetchDestinatarios()
    }
  }, [router])

  const fetchInbox = async () => {
    try {
      setLoading(true)
      const data = await fetchApi<Notificacao[]>("api/notifications/inbox")
      setNotificacoes(data)
    } catch (error) {
      console.error("Erro ao carregar notificações", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDestinatarios = async () => {
    try {
      // Simplificado: Busca atletas. Numa app real poderia buscar utilizadores por grupo/equipa.
      const atletas = await fetchApi<any[]>("api/users/athletes")
      setDestinatariosPossiveis(atletas)
    } catch (e) {
      console.error(e)
    }
  }

  const marcarLida = async (id: string) => {
    try {
      await fetchApi(`api/notifications/inbox/${id}/read`, { method: "PATCH" })
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      )
    } catch (error) {
      console.error("Erro ao marcar como lida", error)
    }
  }

  const marcarTodasLidas = async () => {
    const naoLidasIds = notificacoes.filter(n => !n.lida).map(n => n.id)
    for (const id of naoLidasIds) {
      await marcarLida(id)
    }
    alert("Todas as notificações marcadas como lidas.")
  }

  const handleEnviarMensagem = async () => {
    if (!msgTitulo || !msgCorpo || !msgDestino) return

    try {
      await fetchApi("api/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          targetUserIds: [msgDestino],
          titulo: msgTitulo,
          mensagem: msgCorpo
        })
      })
      alert("A tua mensagem foi entregue ao destinatário.")
      setNovaMsgOpen(false)
      setMsgTitulo("")
      setMsgCorpo("")
      setMsgDestino("")
    } catch (e) {
      alert("Não foi possível enviar a mensagem.")
    }
  }

  if (!user) return null

  const naoLidas = notificacoes.filter((n) => !n.lida)
  const canSendMessages = ["treinador", "secretaria", "gerencia"].includes(user.role)

  return (
    <DashboardLayout role={user.role} userName={user.nome}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Caixa de Entrada</h1>
            <p className="text-muted-foreground">Gere as tuas notificações e mensagens do CAP.</p>
          </div>
          <div className="flex gap-2">
            {naoLidas.length > 0 && (
              <Button variant="outline" onClick={marcarTodasLidas}>
                <CheckCheck className="size-4 mr-2" />
                Marcar todas lidas
              </Button>
            )}

            {canSendMessages && (
              <Dialog open={novaMsgOpen} onOpenChange={setNovaMsgOpen}>
                <DialogTrigger render={
                  <Button>
                    <Send className="size-4 mr-2" />
                    Nova Mensagem
                  </Button>
                } />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enviar Mensagem</DialogTitle>
                    <DialogDescription>
                      A mensagem será enviada como uma notificação para a caixa de entrada do atleta.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Destinatário</Label>
                      <Select value={msgDestino} onValueChange={(val) => setMsgDestino(val || "")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um destinatário" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinatariosPossiveis.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.nome} (Atleta)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assunto</Label>
                      <Input value={msgTitulo} onChange={e => setMsgTitulo(e.target.value)} placeholder="Título da mensagem" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      <Textarea value={msgCorpo} onChange={e => setMsgCorpo(e.target.value)} placeholder="Escreve a tua mensagem aqui..." className="min-h-[100px]" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNovaMsgOpen(false)}>Cancelar</Button>
                    <Button onClick={handleEnviarMensagem}>Enviar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Por Ler
              </CardTitle>
              <Bell className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{naoLidas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Mensagens
              </CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificacoes.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="todas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="nao-lidas">Não Lidas ({naoLidas.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">A carregar notificações...</p>
            ) : notificacoes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Bell className="size-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium">Caixa de entrada vazia</h3>
                  <p className="text-sm text-muted-foreground">Não tens nenhuma notificação de momento.</p>
                </CardContent>
              </Card>
            ) : (
              notificacoes.map(renderNotificacao)
            )}
          </TabsContent>
          
          <TabsContent value="nao-lidas" className="space-y-4">
            {naoLidas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <CheckCircle2 className="size-12 text-success/50 mb-4" />
                  <h3 className="text-lg font-medium">Tudo em dia!</h3>
                  <p className="text-sm text-muted-foreground">Não tens notificações por ler.</p>
                </CardContent>
              </Card>
            ) : (
              naoLidas.map(renderNotificacao)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )

  function renderNotificacao(notif: Notificacao) {
    return (
      <Card key={notif.id} className={`transition-colors ${!notif.lida ? 'bg-primary/5 border-primary/20' : ''}`}>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex gap-4 items-start">
            <div className={`mt-1 p-2 rounded-full ${!notif.lida ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Bell className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${!notif.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notif.titulo}
                </h3>
                {!notif.lida && (
                  <Badge className="bg-primary hover:bg-primary/90">Nova</Badge>
                )}
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  {notif.tipo}
                </Badge>
              </div>
              <p className={`text-sm ${!notif.lida ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                {notif.mensagem}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(notif.dataCriacao).toLocaleDateString("pt-PT")} às {new Date(notif.dataCriacao).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex sm:flex-col gap-2 shrink-0">
            {!notif.lida && (
              <Button size="sm" variant="outline" onClick={() => marcarLida(notif.id)}>
                <CheckCircle2 className="size-4 mr-2" />
                Marcar como lida
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
}
