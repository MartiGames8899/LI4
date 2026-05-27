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

import { fetchApi } from "@/lib/api"

interface Equipa {
  id: string
  nome: string
  atletas?: any[]
}

export default function GerenciaEquipasPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Gerência")
  const [equipas, setEquipas] = useState<Equipa[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newEquipaNome, setNewEquipaNome] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) { router.push("/"); return }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "gerencia") { router.push("/"); return }
    setUserName(parsed.nome || "Gerência")
    fetchEquipas()
  }, [router])

  const fetchEquipas = async () => {
    try {
      setLoading(true)
      const data = await fetchApi<Equipa[]>("/api/sports/teams")
      setEquipas(data)
    } catch (e) {
      console.error("Erro ao carregar equipas", e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEquipa = async () => {
    if (!newEquipaNome) return
    setIsSaving(true)
    try {
      await fetchApi("/api/sports/teams", {
        method: "POST",
        body: JSON.stringify({
          nome: newEquipaNome,
          modalidadeId: "00000000-0000-0000-0000-000000000000",
          escalaoId: "00000000-0000-0000-0000-000000000000",
          treinadorId: null,
        }),
      })
      setIsCreateOpen(false)
      setNewEquipaNome("")
      fetchEquipas()
    } catch (e) {
      alert("Erro ao criar equipa.")
    } finally {
      setIsSaving(false)
    }
  }

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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
                <div className="space-y-2">
                  <Label>Nome da Equipa</Label>
                  <Input
                    value={newEquipaNome}
                    onChange={e => setNewEquipaNome(e.target.value)}
                    placeholder="Ex: Futebol 11 Seniores"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateEquipa} disabled={isSaving || !newEquipaNome}>
                  {isSaving ? "A guardar..." : "Criar Equipa"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
                    <TableHead>Atletas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="size-3" />
                          {e.atletas?.length ?? 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Ativa</Badge>
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
