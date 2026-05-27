"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

function DefinicoesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceChange = searchParams.get("forceChange") === "true"

  const [user, setUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Formulário Pessoal
  const [telefone, setTelefone] = useState("")

  // Notificações
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)

  // Segurança
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("cap_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(storedUser)
    setUser(parsed)
    setTelefone(parsed.telefone || "")

    if (forceChange) {
      alert("Por favor, altere a sua palavra-passe para continuar a utilizar o sistema.")
    }
  }, [router, forceChange])

  const handleSavePessoal = async () => {
    setIsSaving(true)
    try {
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
      await new Promise(r => setTimeout(r, 500))
      alert("As tuas preferências de notificações foram atualizadas.")
    } catch (e) {
      alert("Não foi possível atualizar preferências.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Por favor, preencha todos os campos.")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("A nova palavra-passe e a confirmação não coincidem.")
      return
    }

    setIsSaving(true)
    try {
      await fetchApi("/api/users/profile/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword })
      })
      alert("A tua palavra-passe foi alterada com sucesso.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      if (forceChange) {
        // Redirecionar para dashboard principal se era uma mudança forçada
        router.push(`/dashboard/${user.role}`)
      }
    } catch (e: any) {
      alert(e.message || "Não foi possível alterar a palavra-passe.")
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

        <Tabs defaultValue={forceChange ? "seguranca" : "perfil"} className="space-y-4">
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
                {forceChange && (
                  <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md mb-4">
                    Pela sua segurança, é obrigatório alterar a palavra-passe no primeiro acesso.
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Palavra-passe Atual</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nova Palavra-passe</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Palavra-passe</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleUpdatePassword} disabled={isSaving}>
                  <Lock className="size-4 mr-2" />
                  {isSaving ? "A alterar..." : "Alterar Palavra-passe"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function DefinicoesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Carregando definições...</div>}>
      <DefinicoesContent />
    </Suspense>
  )
}
