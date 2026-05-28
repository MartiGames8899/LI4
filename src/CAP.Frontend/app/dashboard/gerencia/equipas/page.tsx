"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Users, Plus, Trophy } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { fetchApi } from "@/lib/api"

interface Equipa {
  id: string
  nome: string
  modalidadeId?: string
  escalaoId?: string
  treinadorId?: string | null
  atletas?: any[]
}

interface Modalidade {
  id: string
  nome: string
  descricao?: string
}

interface Escalao {
  id: string
  nome: string
  idadeMinima?: number
  idadeMaxima?: number
}

interface Treinador {
  id: string
  nome: string
  email: string
}

export default function GerenciaEquipasPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [equipas, setEquipas] = useState<Equipa[]>([])
  const [modalidades, setModalidades] = useState<Modalidade[]>([])
  const [escaloes, setEscaloes] = useState<Escalao[]>([])
  const [treinadores, setTreinadores] = useState<Treinador[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newEquipa, setNewEquipa] = useState({
    nome: "",
    modalidadeId: "",
    escalaoId: "",
    treinadorId: "",
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    loadAll()
  }, [router])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [eq, mod, esc, tre] = await Promise.all([
        fetchApi<Equipa[]>("/api/sports/teams").catch(() => [] as Equipa[]),
        fetchApi<Modalidade[]>("/api/sports/teams/modalidades").catch(() => [] as Modalidade[]),
        fetchApi<Escalao[]>("/api/sports/teams/escaloes").catch(() => [] as Escalao[]),
        fetchApi<Treinador[]>("/api/users/management/by-role/Treinador").catch(() => [] as Treinador[]),
      ])
      setEquipas(eq)
      setModalidades(mod)
      setEscaloes(esc)
      setTreinadores(tre)
    } catch (e) {
      console.error("Erro ao carregar dados de equipas", e)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setCreateError(null)
    setNewEquipa({ nome: "", modalidadeId: "", escalaoId: "", treinadorId: "" })
    setIsCreateOpen(true)
  }

  const handleCreateEquipa = async () => {
    setCreateError(null)
    if (!newEquipa.nome.trim()) { setCreateError("Indica o nome da equipa."); return }
    if (!newEquipa.modalidadeId) { setCreateError("Seleciona uma modalidade."); return }
    if (!newEquipa.escalaoId) { setCreateError("Seleciona um escalão."); return }

    setIsSaving(true)
    try {
      await fetchApi("/api/sports/teams", {
        method: "POST",
        body: JSON.stringify({
          nome: newEquipa.nome,
          modalidadeId: newEquipa.modalidadeId,
          escalaoId: newEquipa.escalaoId,
          treinadorId: newEquipa.treinadorId || null,
        }),
      })
      setIsCreateOpen(false)
      loadAll()
    } catch (e: any) {
      setCreateError(e.message || "Erro ao criar equipa.")
    } finally {
      setIsSaving(false)
    }
  }

  const modalidadeNome = (id?: string) => modalidades.find(m => m.id === id)?.nome ?? "—"
  const escalaoNome = (id?: string) => escaloes.find(e => e.id === id)?.nome ?? "—"
  const treinadorNome = (id?: string | null) => treinadores.find(t => t.id === id)?.nome ?? "Sem treinador"

  return (
    <DashboardLayout role="gerencia" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-6 text-primary" />
              Gestão de Equipas
            </h1>
            <p className="text-muted-foreground">Visualize e gira as equipas do clube.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(o) => { if (!o) setIsCreateOpen(false); else handleOpenCreate() }}>
            <DialogTrigger render={
              <Button>
                <Plus className="size-4 mr-2" />
                Nova Equipa
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Equipa</DialogTitle>
                <DialogDescription>Crie uma nova equipa no clube.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {createError && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {createError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Nome da Equipa</Label>
                  <Input
                    value={newEquipa.nome}
                    onChange={e => setNewEquipa(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: Futebol 11 Seniores"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modalidade</Label>
                    <Select value={newEquipa.modalidadeId} onValueChange={v => setNewEquipa(f => ({ ...f, modalidadeId: v ?? "" }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {modalidades.length === 0 ? (
                          <SelectItem value="_none" disabled label="Sem modalidades">Sem modalidades disponíveis</SelectItem>
                        ) : modalidades.map(m => (
                          <SelectItem key={m.id} value={m.id} label={m.nome}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Escalão</Label>
                    <Select value={newEquipa.escalaoId} onValueChange={v => setNewEquipa(f => ({ ...f, escalaoId: v ?? "" }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {escaloes.length === 0 ? (
                          <SelectItem value="_none" disabled label="Sem escalões">Sem escalões disponíveis</SelectItem>
                        ) : escaloes.map(e => (
                          <SelectItem key={e.id} value={e.id} label={e.nome}>{e.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Treinador (opcional)</Label>
                  <Select value={newEquipa.treinadorId} onValueChange={v => setNewEquipa(f => ({ ...f, treinadorId: v === "_none" ? "" : (v ?? "") }))}>
                    <SelectTrigger><SelectValue placeholder="Sem treinador atribuído" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none" label="Sem treinador">Sem treinador</SelectItem>
                      {treinadores.map(t => (
                        <SelectItem key={t.id} value={t.id} label={t.nome}>{t.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateEquipa} disabled={isSaving}>
                  {isSaving ? "A guardar..." : "Criar Equipa"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Equipas</CardTitle>
              <Trophy className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Atletas</CardTitle>
              <Users className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {equipas.reduce((acc, e) => acc + (e.atletas?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Modalidades</CardTitle>
              <Building2 className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cap-gold">{modalidades.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Equipas do Clube</CardTitle>
            <CardDescription>{equipas.length} equipas registadas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar equipas...</p>
            ) : equipas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma equipa registada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Escalão</TableHead>
                    <TableHead>Treinador</TableHead>
                    <TableHead>Atletas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{modalidadeNome(e.modalidadeId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{escalaoNome(e.escalaoId)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{treinadorNome(e.treinadorId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="size-3" />
                          {e.atletas?.length ?? 0}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
