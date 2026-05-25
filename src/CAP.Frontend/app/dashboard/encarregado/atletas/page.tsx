"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Heart,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const mockAtletas = [
  {
    id: 1,
    nome: "Joao Silva",
    idade: 12,
    equipa: "Sub-13",
    posicao: "Avancado",
    numero: 10,
    atestadoValido: true,
    atestadoExpira: "2025-06-15",
    quotasEmDia: true,
    presencaMedia: 92,
  },
  {
    id: 2,
    nome: "Maria Silva",
    idade: 10,
    equipa: "Sub-11",
    posicao: "Medio",
    numero: 7,
    atestadoValido: false,
    quotasEmDia: false,
    presencaMedia: 85,
  },
]

export default function AtletasEncarregadoPage() {
  const router = useRouter()

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

  return (
    <DashboardLayout role="encarregado" userName="Manuel Encarregado">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Atletas</h1>
          <p className="text-muted-foreground">Informacao detalhada dos seus educandos</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Atletas
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAtletas.length}</div>
              <p className="text-xs text-muted-foreground">Educandos registados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atestados Validos
              </CardTitle>
              <Heart className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {mockAtletas.filter((a) => a.atestadoValido).length}/{mockAtletas.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quotas em Dia
              </CardTitle>
              <CreditCard className="size-4 text-cap-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAtletas.filter((a) => a.quotasEmDia).length}/{mockAtletas.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {mockAtletas.map((atleta) => (
            <Card key={atleta.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {atleta.nome.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{atleta.nome}</CardTitle>
                      <CardDescription>
                        {atleta.equipa} - #{atleta.numero} - {atleta.posicao}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">{atleta.idade} anos</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {atleta.atestadoValido ? (
                      <Badge variant="outline" className="text-success border-success/30">
                        <CheckCircle className="size-3 mr-1" />
                        Atestado OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="size-3 mr-1" />
                        Sem Atestado
                      </Badge>
                    )}
                    {atleta.quotasEmDia ? (
                      <Badge variant="outline" className="text-success border-success/30">
                        <CreditCard className="size-3 mr-1" />
                        Quotas OK
                      </Badge>
                    ) : (
                      <Badge className="bg-cap-gold/10 text-cap-gold border-cap-gold/20">
                        <Clock className="size-3 mr-1" />
                        Quotas Pendentes
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Presenca Media</p>
                    <p className="text-2xl font-bold text-cap-gold">{atleta.presencaMedia}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Equipa</p>
                    <p className="text-lg font-semibold">{atleta.equipa}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Posicao</p>
                    <p className="text-lg font-semibold">{atleta.posicao}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Atestado Expira</p>
                    <p className="text-lg font-semibold">
                      {atleta.atestadoExpira
                        ? new Date(atleta.atestadoExpira).toLocaleDateString("pt-PT")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => router.push("/dashboard/encarregado/atestados")}>
                    <Heart className="size-4 mr-2" />
                    Gerir Atestado
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard/encarregado/pagamentos")}>
                    <CreditCard className="size-4 mr-2" />
                    Ver Pagamentos
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard/encarregado/calendario")}>
                    <Calendar className="size-4 mr-2" />
                    Calendario
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
