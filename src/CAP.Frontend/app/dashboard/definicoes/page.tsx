"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Settings, 
  Bell, 
  Lock, 
  Shield, 
  Smartphone, 
  Mail, 
  Save 
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { fetchApi } from "@/lib/api"

export default function DefinicoesPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  
  const [isSaving, setIsSaving] = useState(false)

  // Formulário Pessoal
  const [telefone, setTelefone] = useState("")

  // Notificações
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    setUser(parsed)
    setTelefone(parsed.telefone || "")
    // Idealmente, buscaríamos preferências reais da API
  }, [router])

  const handleSavePessoal = async () => {
    setIsSaving(true)
    try {
      // Simular chamada à API
      await new Promise(r => setTimeout(r, 600))
      const updatedUser = { ...user, telefone }
      localStorage.setItem("cap_user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      alert("As tuas informações pessoais foram atualizadas com sucesso.")
    } catch (e) {
      alert("Não foi possível guardar as alterações.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      // Aqui faríamos fetchApi para /api/notifications/preferences
      await new Promise(r => setTimeout(r, 500))
      
      alert("As tuas preferências de notificações foram atualizadas.")
    } catch (e) {
      alert("Não foi possível atualizar preferências.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role={user.role} userName={user.nome}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="size-6 text-primary" />
            Definições da Conta
          </h1>
          <p className="text-muted-foreground">Gere as tuas preferências, informações pessoais e segurança.</p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="size-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="size-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="size-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualiza os teus dados de contacto e identificação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={user.nome} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Sócio</Label>
                    <Input value={user.numeroSocio || "N/A"} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contacto Telefónico</Label>
                    <Input 
                      value={telefone} 
                      onChange={(e) => setTelefone(e.target.value)} 
                      placeholder="9xx xxx xxx" 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSavePessoal} disabled={isSaving}>
                  {isSaving ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Comunicação</CardTitle>
                <CardDescription>Escolhe como queres ser notificado pelo CAP.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">E-mail</h4>
                      <p className="text-sm text-muted-foreground">Recebe resumos diários e anúncios importantes.</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                      <Smartphone className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">SMS</h4>
                      <p className="text-sm text-muted-foreground">Avisos urgentes como alterações de treinos ou jogos.</p>
                    </div>
                  </div>
                  <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                      <Bell className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Notificações em tempo real no dashboard.</p>
                    </div>
                  </div>
                  <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? "A guardar..." : "Guardar Preferências"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Palavra-passe</CardTitle>
                <CardDescription>Atualiza a tua palavra-passe para manter a conta segura.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Palavra-passe Atual</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Nova Palavra-passe</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Palavra-passe</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={() => alert("Password alterada")} variant="default">
                  <Lock className="size-4 mr-2" />
                  Alterar Palavra-passe
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  )
}
