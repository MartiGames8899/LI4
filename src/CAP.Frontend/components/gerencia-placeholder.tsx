"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function GerenciaPlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <DashboardLayout role="gerencia" userName="Miguel Gerente">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="size-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl mb-2">Página em Desenvolvimento</CardTitle>
            <CardDescription className="max-w-md">
              Esta funcionalidade do painel de gerência está a ser implementada e estará disponível brevemente.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
