"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Package, Shirt, Trophy } from "lucide-react"

import { fetchApi } from "@/lib/api"

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  stockAtual: number
  imagemUrl: string
  // Add missing frontend-only fields for now or map them
  categoria?: string
  tamanhos?: string[]
  destaque?: boolean
}

interface CartItem {
  produto: Produto
  tamanho: string
  quantidade: number
}

export default function LojaAtletaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<CartItem[]>([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")
  const [encomendas, setEncomendas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [produtosData, encomendasData] = await Promise.all([
          fetchApi<any[]>("api/facilities/store/products"),
          fetchApi<any[]>("api/facilities/store/orders")
        ])
        const mapped = produtosData.map(p => ({
          id: p.id,
          nome: p.nome,
          descricao: p.descricao,
          preco: p.preco,
          stockAtual: p.stockAtual,
          imagemUrl: p.imagemUrl || "/images/logo-cap.png",
          categoria: "equipamento", // default if none
          tamanhos: ["XS", "S", "M", "L", "XL"], // default sizes
          destaque: p.stockAtual > 20
        }))
        setProdutos(mapped)
        setEncomendas(encomendasData || [])
      } catch (error) {
        console.error("Erro ao carregar loja:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])


  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado || !tamanhoSelecionado) return
    
    const existente = carrinho.find(
      item => item.produto.id === produtoSelecionado.id && item.tamanho === tamanhoSelecionado
    )

    if (existente) {
      setCarrinho(carrinho.map(item =>
        item.produto.id === produtoSelecionado.id && item.tamanho === tamanhoSelecionado
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ))
    } else {
      setCarrinho([...carrinho, { produto: produtoSelecionado, tamanho: tamanhoSelecionado, quantidade: 1 }])
    }
    
    setProdutoSelecionado(null)
    setTamanhoSelecionado("")
  }

  const removerDoCarrinho = (produtoId: string, tamanho: string) => {
    setCarrinho(carrinho.filter(item => !(item.produto.id === produtoId && item.tamanho === tamanho)))
  }

  const atualizarQuantidade = (produtoId: string, tamanho: string, delta: number) => {
    setCarrinho(carrinho.map(item => {
      if (item.produto.id === produtoId && item.tamanho === tamanho) {
        const novaQuantidade = item.quantidade + delta
        return novaQuantidade > 0 ? { ...item, quantidade: novaQuantidade } : item
      }
      return item
    }).filter(item => item.quantidade > 0))
  }

  const totalCarrinho = carrinho.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0)
  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0)

  return (
    <DashboardLayout role="atleta" userName="Joao Silva">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loja CAP</h1>
            <p className="text-muted-foreground">Equipamentos e acessorios oficiais do clube</p>
          </div>
          <Dialog open={carrinhoAberto} onOpenChange={setCarrinhoAberto}>
            <DialogTrigger>
              <Button className="relative">
                <ShoppingCart className="mr-2" />
                Carrinho
                {totalItens > 0 && (
                  <Badge className="absolute -right-2 -top-2 bg-accent text-accent-foreground">
                    {totalItens}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Carrinho de Compras</DialogTitle>
                <DialogDescription>
                  {carrinho.length === 0 ? "O carrinho esta vazio" : `${totalItens} item(s) no carrinho`}
                </DialogDescription>
              </DialogHeader>
              {carrinho.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="max-h-[300px] overflow-y-auto">
                    {carrinho.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b py-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.produto.nome}</p>
                          <p className="text-xs text-muted-foreground">Tamanho: {item.tamanho}</p>
                          <p className="text-sm font-semibold text-primary">{(item.produto.preco * item.quantidade).toFixed(2)} EUR</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => atualizarQuantidade(item.produto.id, item.tamanho, -1)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantidade}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => atualizarQuantidade(item.produto.id, item.tamanho, 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive"
                            onClick={() => removerDoCarrinho(item.produto.id, item.tamanho)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{totalCarrinho.toFixed(2)} EUR</span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                {carrinho.length > 0 && (
                  <Button className="w-full" onClick={async () => {
                    try {
                      await fetchApi("api/facilities/store/orders", {
                        method: "POST",
                        body: JSON.stringify({
                          items: carrinho.map(c => ({ produtoId: c.produto.id, quantidade: c.quantidade }))
                        })
                      })
                      const updatedOrders = await fetchApi<any[]>("api/facilities/store/orders")
                      setEncomendas(updatedOrders || [])
                      setCarrinho([])
                      setCarrinhoAberto(false)
                      alert("Encomenda submetida!")
                    } catch (e) {
                      console.error(e)
                      alert("Erro ao encomendar.")
                    }
                  }}>
                    <CreditCard className="mr-2" />
                    Finalizar Encomenda
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todos" className="w-full">
          <TabsList>
            <TabsTrigger value="todos">
              <Package className="mr-2 size-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="equipamento">
              <Shirt className="mr-2 size-4" />
              Equipamento
            </TabsTrigger>
            <TabsTrigger value="acessorios">
              <Trophy className="mr-2 size-4" />
              Acessorios
            </TabsTrigger>
            <TabsTrigger value="encomendas">
              <Package className="mr-2 size-4" />
              Minhas Encomendas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProdutos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  onSelect={() => {
                    setProdutoSelecionado(produto)
                    setTamanhoSelecionado("")
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="equipamento" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProdutos.filter(p => p.categoria === "equipamento").map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  onSelect={() => {
                    setProdutoSelecionado(produto)
                    setTamanhoSelecionado("")
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="acessorios" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProdutos.filter(p => p.categoria === "acessorios").map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  onSelect={() => {
                    setProdutoSelecionado(produto)
                    setTamanhoSelecionado("")
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="encomendas" className="mt-6">
            <div className="flex flex-col gap-4">
              {encomendas.length === 0 ? (
                <p className="text-muted-foreground">Não tem encomendas recentes.</p>
              ) : (
                encomendas.map((enc) => (
                  <Card key={enc.id}>
                    <CardHeader className="py-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Encomenda #{enc.id.substring(0, 8)}</CardTitle>
                        <Badge variant={enc.estado === 0 ? "secondary" : "default"}>
                          {enc.estado === 0 ? "Pendente" : "Processada"}
                        </Badge>
                      </div>
                      <CardDescription>Total: {enc.total.toFixed(2)} EUR</CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog Produto */}
        <Dialog open={!!produtoSelecionado} onOpenChange={(open) => !open && setProdutoSelecionado(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{produtoSelecionado?.nome}</DialogTitle>
              <DialogDescription>
                Selecione o tamanho pretendido
              </DialogDescription>
            </DialogHeader>
            {produtoSelecionado && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center rounded-lg bg-muted p-6">
                  <img
                    src={produtoSelecionado.imagemUrl}
                    alt={produtoSelecionado.nome}
                    className="size-32 object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{produtoSelecionado.preco.toFixed(2)} EUR</span>
                  <Badge variant={produtoSelecionado.stockAtual > 10 ? "secondary" : "outline"}>
                    {produtoSelecionado.stockAtual} em stock
                  </Badge>
                </div>
                <Select value={tamanhoSelecionado} onValueChange={(value) => setTamanhoSelecionado(value ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtoSelecionado.tamanhos?.map((tamanho) => (
                      <SelectItem key={tamanho} value={tamanho}>
                        {tamanho}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button
                className="w-full"
                disabled={!tamanhoSelecionado}
                onClick={adicionarAoCarrinho}
              >
                <ShoppingCart className="mr-2" />
                Adicionar ao Carrinho
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function ProdutoCard({ produto, onSelect }: { produto: Produto; onSelect: () => void }) {
  return (
    <Card className="group cursor-pointer transition-shadow hover:shadow-md" onClick={onSelect}>
      <CardHeader className="p-4">
        <div className="relative flex items-center justify-center rounded-lg bg-muted p-4">
          <img
            src={produto.imagemUrl}
            alt={produto.nome}
            className="size-24 object-contain transition-transform group-hover:scale-105"
          />
          {produto.destaque && (
            <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground">
              Destaque
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardTitle className="line-clamp-2 text-sm">{produto.nome}</CardTitle>
        <CardDescription className="mt-1 capitalize">{produto.categoria}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <span className="text-lg font-bold text-primary">{produto.preco.toFixed(2)} EUR</span>
        <Badge variant={produto.stockAtual > 10 ? "secondary" : "outline"} className="text-xs">
          {produto.stockAtual} disp.
        </Badge>
      </CardFooter>
    </Card>
  )
}
