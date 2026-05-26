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
import { fetchApi } from "@/lib/api"

export default function AtestadosEncarregadoPage() {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [atestados, setAtestados] = useState<any[]>([])
  const [dependentes, setDependentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedAtleta, setSelectedAtleta] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
      
      let allAtestados = []

      for (const d of deps) {
        const d_atestados: any[] = await fetchApi<any[]>(`api/clinical/certificates/athlete/${d.id}`).catch(() => [])
        
        if (d_atestados.length === 0) {
            allAtestados.push({
                id: d.id, // temporary id for UI
                atletaId: d.id,
                atleta: d.nome,
                equipa: "Sem equipa", // mock
                tipo: "médico",
                dataEmissao: null,
                dataValidade: null,
                status: "em_falta"
            })
        } else {
            // Sort to get latest
            const sorted = d_atestados.sort((a, b) => new Date(b.dataExpiracao).getTime() - new Date(a.dataExpiracao).getTime())
            const latest = sorted[0]
            const isValid = new Date(latest.dataExpiracao) > new Date()
            allAtestados.push({
                id: latest.id,
                atletaId: d.id,
                atleta: d.nome,
                equipa: "Sem equipa",
                tipo: "médico",
                dataEmissao: latest.dataEmissao,
                dataValidade: latest.dataExpiracao,
                status: isValid ? "valido" : "expirado"
            })
        }
      }

      setAtestados(allAtestados)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedAtleta || !selectedFile) return;

    try {
        // Em um caso real, criaríamos o atestado primeiro se ele não existir
        // Mas como a UI atual não tem "criar atestado" (temos a API api/clinical/certificates via POST), 
        // Vamos apenas simular a criação/upload na UI ou chamar o endpoint de criar
        
        const createReq = {
            atletaId: selectedAtleta,
            dataEmissao: new Date().toISOString(),
            dataExpiracao: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            medicoResponsavel: "Médico Externo",
            observacoes: ""
        };

        const novoAtestado: any = await fetchApi("api/clinical/certificates", {
            method: "POST",
            body: JSON.stringify(createReq)
        });

        // E então fazer o upload do ficheiro se necessário
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedFile);
        
        await fetchApi(`api/clinical/certificates/${novoAtestado.id}/upload`, {
           method: "POST",
           body: formDataUpload
        })

        setUploadOpen(false);
        fetchData(); // recarregar
    } catch(err) {
        console.error(err);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valido":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="size-3 mr-1" />
            Válido
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

  const validos = atestados.filter((a) => a.status === "valido").length
  const emFalta = atestados.filter((a) => a.status === "em_falta" || a.status === "expirado").length

  if (loading) {
    return <div className="flex h-screen items-center justify-center">A carregar...</div>
  }

  return (
    <DashboardLayout role="encarregado" userName="O Meu Perfil">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atestados Médicos</h1>
            <p className="text-muted-foreground">Gestão de atestados dos seus educandos</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger render={<Button />}>
              <Upload className="size-4 mr-2" />
              Submeter Atestado
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submeter Atestado</DialogTitle>
                <DialogDescription>
                  Carregue o atestado médico do seu educando
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Atleta</Label>
                  <Select value={selectedAtleta} onValueChange={(v) => setSelectedAtleta(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {dependentes.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Atestado</Label>
                  <Select defaultValue="medico">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="desportivo">Desportivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ficheiro</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : "Clique para selecionar o ficheiro"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG ou PNG (max. 5MB)
                    </p>
                    <Input type="file" className="hidden" id="file-upload" onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setSelectedFile(e.target.files[0])
                        }
                    }} />
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => document.getElementById("file-upload")?.click()}>
                      Selecionar Ficheiro
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={!selectedAtleta || !selectedFile}>
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
                    {emFalta} atleta(s) sem atestado médico válido. Os atletas não poderão participar em atividades oficiais.
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
              <div className="text-2xl font-bold">{atestados.length}</div>
              <p className="text-xs text-muted-foreground">Atletas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Válidos
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
            <CardDescription>Estado atual dos atestados médicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atestados.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Não há dados disponíveis.</p>
              )}
              {atestados.map((atestado) => (
                <div
                  key={atestado.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {atestado.atleta.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{atestado.atleta}</p>
                      <p className="text-sm text-muted-foreground">{atestado.equipa}</p>
                      {atestado.dataValidade && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="size-3" />
                          Válido até {new Date(atestado.dataValidade).toLocaleDateString("pt-PT")}
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
                      <Button size="sm" onClick={() => {
                          setSelectedAtleta(atestado.atletaId)
                          setUploadOpen(true)
                      }}>
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
