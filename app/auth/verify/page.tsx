import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
          <Mail className="h-10 w-10 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verifique seu e-mail</h1>
        <p className="text-muted-foreground">
          Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada e clique no link
          para ativar sua conta.
        </p>
        <div className="pt-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/auth/login">Voltar para o login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

