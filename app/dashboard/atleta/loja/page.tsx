"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Package, Shirt, Trophy } from "lucide-react"

const produtos = [
  {
    id: 1,
    nome: "Camisola Oficial CAP 2024/25",
    categoria: "equipamento",
    preco: 45.00,
    tamanhos: ["XS", "S", "M", "L", "XL"],
    imagem: "/images/logo-cap.png",
    stock: 25,
    destaque: true
  },
  {
    id: 2,
    nome: "Calcoes Treino",
    categoria: "equipamento",
    preco: 22.00,
    tamanhos: ["XS", "S", "M", "L", "XL"],
    imagem: "/images/logo-cap.png",
    stock: 40,
    destaque: false
  },
  {
    id: 3,
    nome: "Meias Oficiais (Par)",
    categoria: "equipamento",
    preco: 8.00,
    tamanhos: ["35-38", "39-42", "43-46"],
    imagem: "/images/logo-cap.png",
    stock: 60,
    destaque: false
  },
  {
    id: 4,
    nome: "Fato de Treino Completo",
    categoria: "equipamento",
    preco: 65.00,
    tamanhos: ["XS", "S", "M", "L", "XL"],
    imagem: "/images/logo-cap.png",
    stock: 15,
    destaque: true
  },
  {
    id: 5,
    nome: "Saco Desporto CAP",
    categoria: "acessorios",
    preco: 28.00,
    tamanhos: ["Unico"],
    imagem: "/images/logo-cap.png",
    stock: 30,
    destaque: false
  },
  {
    id: 6,
    nome: "Garrafa de Agua 750ml",
    categoria: "acessorios",
    preco: 12.00,
    tamanhos: ["Unico"],
    imagem: "/images/logo-cap.png",
    stock: 50,
    destaque: false
  },
  {
    id: 7,
    nome: "Bone CAP",
    categoria: "acessorios",
    preco: 15.00,
    tamanhos: ["Unico"],
    imagem: "/images/logo-cap.png",
    stock: 35,
    destaque: false
  },
  {
    id: 8,
    nome: "Cachecol CAP",
    categoria: "acessorios",
    preco: 18.00,
    tamanhos: ["Unico"],
    imagem: "/images/logo-cap.png",
    stock: 20,
    destaque: true
  }
]

interface CartItem {
  produto: typeof produtos[0]
  tamanho: string
  quantidade: number
}

export default function LojaAtletaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [carrinho, setCarrinho] = useState<CartItem[]>([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<typeof produtos[0] | null>(null)
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")

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

  const removerDoCarrinho = (produtoId: number, tamanho: string) => {
    setCarrinho(carrinho.filter(item => !(item.produto.id === produtoId && item.tamanho === tamanho)))
  }

  const atualizarQuantidade = (produtoId: number, tamanho: string, delta: number) => {
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
                  <Button className="w-full">
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
                    src={produtoSelecionado.imagem}
                    alt={produtoSelecionado.nome}
                    className="size-32 object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{produtoSelecionado.preco.toFixed(2)} EUR</span>
                  <Badge variant={produtoSelecionado.stock > 10 ? "secondary" : "outline"}>
                    {produtoSelecionado.stock} em stock
                  </Badge>
                </div>
                <Select value={tamanhoSelecionado} onValueChange={(value) => setTamanhoSelecionado(value ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtoSelecionado.tamanhos.map((tamanho) => (
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

function ProdutoCard({ produto, onSelect }: { produto: typeof produtos[0]; onSelect: () => void }) {
  return (
    <Card className="group cursor-pointer transition-shadow hover:shadow-md" onClick={onSelect}>
      <CardHeader className="p-4">
        <div className="relative flex items-center justify-center rounded-lg bg-muted p-4">
          <img
            src={produto.imagem}
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
        <Badge variant={produto.stock > 10 ? "secondary" : "outline"} className="text-xs">
          {produto.stock} disp.
        </Badge>
      </CardFooter>
    </Card>
  )
}
