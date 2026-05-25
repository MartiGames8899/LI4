"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Heart,
  Upload,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const mockAtestados = [
  {
    id: 1,
    atleta: "Joao Silva",
    equipa: "Sub-13",
    tipo: "desportivo",
    dataEmissao: "2024-06-15",
    dataValidade: "2025-06-15",
    status: "valido",
  },
  {
    id: 2,
    atleta: "Maria Silva",
    equipa: "Sub-11",
    tipo: "medico",
    dataEmissao: null,
    dataValidade: null,
    status: "em_falta",
  },
]

export default function AtestadosEncarregadoPage() {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== "encarregado") {
      router.push("/")
    }
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valido":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="size-3 mr-1" />
            Valido
          </Badge>
        )
      case "a_expirar":
        return (
          <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">
            <Clock className="size-3 mr-1" />
            A Expirar
          </Badge>
        )
      case "expirado":
      case "em_falta":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="size-3 mr-1" />
            {status === "expirado" ? "Expirado" : "Em Falta"}
          </Badge>
        )
      default:
        return null
    }
  }

  const validos = mockAtestados.filter((a) => a.status === "valido").length
  const emFalta = mockAtestados.filter((a) => a.status === "em_falta" || a.status === "expirado").length

  return (
    <DashboardLayout role="encarregado" userName="Manuel Encarregado">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atestados Medicos</h1>
            <p className="text-muted-foreground">Gestao de atestados dos seus educandos</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger>
              <Button>
                <Upload className="size-4 mr-2" />
                Submeter Atestado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submeter Atestado</DialogTitle>
                <DialogDescription>
                  Carregue o atestado medico do seu educando
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Atleta</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joao">Joao Silva - Sub-13</SelectItem>
                      <SelectItem value="maria">Maria Silva - Sub-11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Atestado</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Medico</SelectItem>
                      <SelectItem value="desportivo">Desportivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Emissao</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Validade</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Ficheiro</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Arraste o ficheiro ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG ou PNG (max. 5MB)
                    </p>
                    <Input type="file" className="hidden" />
                    <Button variant="outline" size="sm" className="mt-3">
                      Selecionar Ficheiro
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setUploadOpen(false)}>
                  Submeter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {emFalta > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Atestado(s) em Falta</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {emFalta} atleta(s) sem atestado medico valido. Os atletas nao poderao participar em atividades oficiais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
              <Heart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAtestados.length}</div>
              <p className="text-xs text-muted-foreground">Atletas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Validos
              </CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{validos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Falta
              </CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{emFalta}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atestados dos Meus Educandos</CardTitle>
            <CardDescription>Estado atual dos atestados medicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAtestados.map((atestado) => (
                <div
                  key={atestado.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {atestado.atleta.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{atestado.atleta}</p>
                      <p className="text-sm text-muted-foreground">{atestado.equipa}</p>
                      {atestado.dataValidade && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="size-3" />
                          Valido ate {new Date(atestado.dataValidade).toLocaleDateString("pt-PT")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(atestado.status)}
                    {atestado.status === "valido" ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="size-8">
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Download className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setUploadOpen(true)}>
                        <Upload className="size-4 mr-1" />
                        Submeter
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
