"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Euro, Calendar, CheckCircle, Clock, AlertCircle, CreditCard, Receipt, Download, Wallet } from "lucide-react"

const pagamentos = [
  {
    id: 1,
    descricao: "Mensalidade Futebol - Janeiro 2024",
    atleta: "Joao Pedro Silva",
    escalao: "Sub-15",
    valor: 35.00,
    dataVencimento: "2024-01-10",
    dataPagamento: "2024-01-08",
    estado: "pago",
    tipo: "mensalidade"
  },
  {
    id: 2,
    descricao: "Mensalidade Futebol - Fevereiro 2024",
    atleta: "Joao Pedro Silva",
    escalao: "Sub-15",
    valor: 35.00,
    dataVencimento: "2024-02-10",
    dataPagamento: null,
    estado: "pendente",
    tipo: "mensalidade"
  },
  {
    id: 3,
    descricao: "Seguro Desportivo 2024",
    atleta: "Joao Pedro Silva",
    escalao: "Sub-15",
    valor: 25.00,
    dataVencimento: "2024-01-15",
    dataPagamento: "2024-01-12",
    estado: "pago",
    tipo: "seguro"
  },
  {
    id: 4,
    descricao: "Equipamento Oficial 2024/25",
    atleta: "Joao Pedro Silva",
    escalao: "Sub-15",
    valor: 85.00,
    dataVencimento: "2024-01-31",
    dataPagamento: null,
    estado: "pendente",
    tipo: "equipamento"
  },
  {
    id: 5,
    descricao: "Mensalidade Basquetebol - Janeiro 2024",
    atleta: "Maria Silva",
    escalao: "Sub-12",
    valor: 30.00,
    dataVencimento: "2024-01-10",
    dataPagamento: "2024-01-05",
    estado: "pago",
    tipo: "mensalidade"
  },
  {
    id: 6,
    descricao: "Mensalidade Basquetebol - Fevereiro 2024",
    atleta: "Maria Silva",
    escalao: "Sub-12",
    valor: 30.00,
    dataVencimento: "2024-02-10",
    dataPagamento: null,
    estado: "pendente",
    tipo: "mensalidade"
  }
]

const educandos = [
  { nome: "Joao Pedro Silva", escalao: "Sub-15", modalidade: "Futebol" },
  { nome: "Maria Silva", escalao: "Sub-12", modalidade: "Basquetebol" }
]

export default function PagamentosEncarregadoPage() {
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<typeof pagamentos[0] | null>(null)

  const pendentes = pagamentos.filter(p => p.estado === "pendente")
  const pagos = pagamentos.filter(p => p.estado === "pago")
  const totalPendente = pendentes.reduce((sum, p) => sum + p.valor, 0)
  const totalPago = pagos.reduce((sum, p) => sum + p.valor, 0)

  return (
    <DashboardLayout role="encarregado" userName="Carlos Silva">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
            <p className="text-muted-foreground">Consulte e efetue pagamentos dos seus educandos</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Historico Completo
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
                {educandos.map((ed, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {ed.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{ed.nome}</p>
                      <p className="text-xs text-muted-foreground">{ed.modalidade} - {ed.escalao}</p>
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
                Tem {pendentes.length} pagamento(s) a aguardar regularizacao
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
                            {pag.atleta.split(" ").map(n => n[0]).join("")}
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
                      <Dialog>
                        <DialogTrigger>
                          <Button className="w-full">
                            <CreditCard className="mr-2 size-4" />
                            Pagar Agora
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Efetuar Pagamento</DialogTitle>
                            <DialogDescription>
                              {pag.descricao}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-4">
                            <div className="rounded-lg border p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Valor a pagar:</span>
                                <span className="text-2xl font-bold text-primary">{pag.valor.toFixed(2)} EUR</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Atleta: {pag.atleta}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p className="text-sm font-medium">Metodo de Pagamento</p>
                              <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="h-auto flex-col gap-1 py-4">
                                  <CreditCard className="size-6" />
                                  <span className="text-xs">MB Way</span>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-1 py-4">
                                  <Receipt className="size-6" />
                                  <span className="text-xs">Multibanco</span>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-1 py-4">
                                  <Wallet className="size-6" />
                                  <span className="text-xs">Transferencia</span>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-1 py-4">
                                  <Euro className="size-6" />
                                  <span className="text-xs">Presencial</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button className="w-full">Confirmar Pagamento</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historico */}
        <Card>
          <CardHeader>
            <CardTitle>Historico de Pagamentos</CardTitle>
            <CardDescription>Todos os pagamentos efetuados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Data Pagamento</TableHead>
                  <TableHead className="text-right">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                            {pag.atleta.split(" ").map(n => n[0]).join("")}
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
