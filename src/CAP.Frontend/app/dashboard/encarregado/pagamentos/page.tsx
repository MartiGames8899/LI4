"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Euro, Calendar, CheckCircle, Clock, AlertCircle, CreditCard, Receipt, Download, Wallet } from "lucide-react"
import { fetchApi } from "@/lib/api"

export default function PagamentosEncarregadoPage() {
  const router = useRouter()
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [dependentes, setDependentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<any | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [metodo, setMetodo] = useState("Transferencia")
  const [paymentStep, setPaymentStep] = useState<"select" | "reference">("select")
  const [referenceData, setReferenceData] = useState<any | null>(null)

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
      const deps = data.dependentes || []
      setDependentes(deps)
      
      let allPagamentos: any[] = []

      for (const d of deps) {
        const quotas: any[] = await fetchApi<any[]>(`api/finance/quotas/athlete/${d.id}`).catch(() => [])
        const pags: any[] = await fetchApi<any[]>(`api/finance/payments/athlete/${d.id}`).catch(() => [])
        
        // Quotas pendentes (nÃ£o pagas)
        const pendentes = quotas.filter(q => q.estado !== 2).map(q => ({
            id: q.id,
            quotaId: q.id,
            atletaId: d.id,
            descricao: `Quota Pendente`, // We lack definicao name here ideally
            atleta: d.nome,
            escalao: "Sub-15",
            valor: q.valorTotal - q.valorPago,
            dataVencimento: q.dataVencimento,
            dataPagamento: null,
            estado: "pendente",
            tipo: "mensalidade"
        }))

        // Pagamentos efetuados
        const pagos = pags.map(p => ({
            id: p.id,
            atletaId: d.id,
            descricao: `Pagamento ${p.referencia || ''}`,
            atleta: d.nome,
            escalao: "Sub-15",
            valor: p.valor,
            dataVencimento: null,
            dataPagamento: p.dataPagamento || new Date().toISOString(), // Mock if not present
            estado: "pago",
            tipo: "mensalidade"
        }))

        allPagamentos = [...allPagamentos, ...pendentes, ...pagos]
      }

      setPagamentos(allPagamentos)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePagar = async () => {
      if (!pagamentoSelecionado) return;
      try {
          if (metodo === "MBWay" || metodo === "Multibanco") {
              const refResp = await fetchApi("api/finance/payments/generate", {
                  method: "POST",
                  body: JSON.stringify({
                      atletaId: pagamentoSelecionado.atletaId,
                      valor: pagamentoSelecionado.valor,
                      metodo
                  })
              })
              setReferenceData(refResp)
              setPaymentStep("reference")
          } else {
              await fetchApi("api/finance/payments", {
                  method: "POST",
                  body: JSON.stringify({
                      atletaId: pagamentoSelecionado.atletaId,
                      valor: pagamentoSelecionado.valor,
                      metodo,
                      referencia: "PGT_" + Date.now(),
                      quotasIds: [pagamentoSelecionado.quotaId]
                  })
              })
              setPaymentDialogOpen(false)
              fetchData()
          }
      } catch (err) {
          console.error(err)
      }
  }

  const handleConfirmReference = async () => {
      if (!pagamentoSelecionado) return;
      try {
          await fetchApi("api/finance/payments", {
              method: "POST",
              body: JSON.stringify({
                  atletaId: pagamentoSelecionado.atletaId,
                  valor: pagamentoSelecionado.valor,
                  metodo,
                  referencia: referenceData?.referencia || "MBW_" + Date.now(),
                  quotasIds: [pagamentoSelecionado.quotaId]
              })
          })
          setPaymentDialogOpen(false)
          setPaymentStep("select")
          setReferenceData(null)
          fetchData()
      } catch (err) {
          console.error(err)
      }
  }

  const pendentes = pagamentos.filter(p => p.estado === "pendente")
  const pagos = pagamentos.filter(p => p.estado === "pago")
  const totalPendente = pendentes.reduce((sum, p) => sum + p.valor, 0)
  const totalPago = pagos.reduce((sum, p) => sum + p.valor, 0)

  if (loading) {
      return <div className="flex h-screen items-center justify-center">A carregar...</div>
  }

  return (
    <DashboardLayout role="encarregado" userName="O Meu Perfil">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
            <p className="text-muted-foreground">Consulte e efetue pagamentos dos seus educandos</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            HistÃ³rico Completo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
              <AlertCircle className="size-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{totalPendente.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">{pendentes.length} pagamento(s)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pago Este Ano</CardTitle>
              <CheckCircle className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalPago.toFixed(2)} EUR</div>
              <p className="text-xs text-muted-foreground">{pagos.length} pagamento(s)</p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Educandos Inscritos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {dependentes.map((ed, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {ed.nome.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{ed.nome}</p>
                      <p className="text-xs text-muted-foreground">{ed.posicao} - #{ed.numeroCamisola}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pagamentos Pendentes */}
        {pendentes.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-600" />
                <CardTitle className="text-amber-800">Pagamentos Pendentes</CardTitle>
              </div>
              <CardDescription className="text-amber-700">
                Tem {pendentes.length} pagamento(s) a aguardar regularizaÃ§Ã£o
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {pendentes.map((pag) => (
                  <Card key={pag.id} className="bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="capitalize">{pag.tipo}</Badge>
                        <Badge variant="outline" className="bg-amber-100 text-amber-700">Pendente</Badge>
                      </div>
                      <CardTitle className="text-base">{pag.descricao}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarFallback className="text-[10px]">
                            {pag.atleta.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {pag.atleta}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="size-4" />
                          Vence: {new Date(pag.dataVencimento).toLocaleDateString("pt-PT")}
                        </div>
                        <span className="text-xl font-bold text-primary">{pag.valor.toFixed(2)} EUR</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => {
                          setPagamentoSelecionado(pag);
                          setPaymentDialogOpen(true);
                      }}>
                        <CreditCard className="mr-2 size-4" />
                        Pagar Agora
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={paymentDialogOpen} onOpenChange={(open) => {
            setPaymentDialogOpen(open);
            if (!open) {
                setPaymentStep("select");
                setReferenceData(null);
            }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Efetuar Pagamento</DialogTitle>
              <DialogDescription>
                {pagamentoSelecionado?.descricao}
              </DialogDescription>
            </DialogHeader>
            {paymentStep === "select" ? (
                <>
                  {pagamentoSelecionado && (
                      <div className="flex flex-col gap-4">
                      <div className="rounded-lg border p-4">
                          <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Valor a pagar:</span>
                          <span className="text-2xl font-bold text-primary">{pagamentoSelecionado.valor.toFixed(2)} EUR</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                          Atleta: {pagamentoSelecionado.atleta}
                          </div>
                      </div>
                      <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium">MÃ©todo de Pagamento</p>
                          <div className="grid grid-cols-2 gap-2">
                          <Button variant={metodo === "MBWay" ? "default" : "outline"} onClick={() => setMetodo("MBWay")} className="h-auto flex-col gap-1 py-4">
                              <CreditCard className="size-6" />
                              <span className="text-xs">MB Way</span>
                          </Button>
                          <Button variant={metodo === "Multibanco" ? "default" : "outline"} onClick={() => setMetodo("Multibanco")} className="h-auto flex-col gap-1 py-4">
                              <Receipt className="size-6" />
                              <span className="text-xs">Multibanco</span>
                          </Button>
                          <Button variant={metodo === "Transferencia" ? "default" : "outline"} onClick={() => setMetodo("Transferencia")} className="h-auto flex-col gap-1 py-4">
                              <Wallet className="size-6" />
                              <span className="text-xs">TransferÃªncia</span>
                          </Button>
                          <Button variant={metodo === "Presencial" ? "default" : "outline"} onClick={() => setMetodo("Presencial")} className="h-auto flex-col gap-1 py-4">
                              <Euro className="size-6" />
                              <span className="text-xs">Presencial</span>
                          </Button>
                          </div>
                      </div>
                      </div>
                  )}
                  <DialogFooter>
                    <Button className="w-full" onClick={handlePagar}>
                       {metodo === "MBWay" || metodo === "Multibanco" ? "Gerar ReferÃªncia" : "Confirmar Pagamento"}
                    </Button>
                  </DialogFooter>
                </>
            ) : (
                <>
                  <div className="flex flex-col gap-4">
                      {metodo === "MBWay" ? (
                          <div className="rounded-lg border p-6 text-center bg-muted/50">
                              <h3 className="text-lg font-semibold mb-2">Aguardando ConfirmaÃ§Ã£o MB WAY</h3>
                              <p className="text-sm text-muted-foreground mb-4">Foi enviado um pedido para o nÃºmero associado.</p>
                              <div className="text-2xl font-bold mb-2">{referenceData?.telefone}</div>
                              <div className="text-sm">Valor: {referenceData?.valor?.toFixed(2)} EUR</div>
                          </div>
                      ) : (
                          <div className="rounded-lg border p-6 text-center bg-muted/50">
                              <h3 className="text-lg font-semibold mb-4">Dados para Pagamento Multibanco</h3>
                              <div className="grid grid-cols-2 gap-2 text-left max-w-[200px] mx-auto mb-4">
                                  <span className="text-muted-foreground text-sm">Entidade:</span>
                                  <span className="font-mono">{referenceData?.entidade}</span>
                                  <span className="text-muted-foreground text-sm">ReferÃªncia:</span>
                                  <span className="font-mono">{referenceData?.referencia?.match(/.{1,3}/g)?.join(' ')}</span>
                                  <span className="text-muted-foreground text-sm">Valor:</span>
                                  <span className="font-mono">{referenceData?.valor?.toFixed(2)} EUR</span>
                              </div>
                          </div>
                      )}
                      <p className="text-xs text-center text-muted-foreground">Nota: Para fins de demonstraÃ§Ã£o, clique em "Simular Pagamento" para concluir o processo.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPaymentStep("select")}>Voltar</Button>
                    <Button onClick={handleConfirmReference}>Simular Pagamento</Button>
                  </DialogFooter>
                </>
            )}
          </DialogContent>
        </Dialog>

        {/* Historico */}
        <Card>
          <CardHeader>
            <CardTitle>HistÃ³rico de Pagamentos</CardTitle>
            <CardDescription>Todos os pagamentos efetuados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DescriÃ§Ã£o</TableHead>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Data Pagamento</TableHead>
                  <TableHead className="text-right">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Sem histÃ³rico de pagamentos.</TableCell>
                    </TableRow>
                )}
                {pagos.map((pag) => (
                  <TableRow key={pag.id}>
                    <TableCell>
                      <div className="font-medium">{pag.descricao}</div>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">{pag.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {pag.atleta.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{pag.atleta}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{pag.valor.toFixed(2)} EUR</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="mr-1 size-3" />
                        Pago
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {pag.dataPagamento ? new Date(pag.dataPagamento).toLocaleDateString("pt-PT") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
