"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("contact_messages").insert([{ name, email, subject, message }])

      if (error) throw error

      toast({
        title: "Mensagem enviada",
        description: "Agradecemos seu contato. Responderemos em breve!",
      })

      // Limpar formulário
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Entre em <span className="text-purple-600">Contato</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Estamos aqui para ajudar. Envie-nos uma mensagem e responderemos o mais breve possível.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter">Informações de Contato</h2>
                <p className="text-muted-foreground">
                  Você pode entrar em contato conosco através dos canais abaixo ou preenchendo o formulário ao lado.
                </p>
                <div className="grid gap-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold">E-mail</h3>
                      <p className="text-muted-foreground">contato@realsolv.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-bold">Telefone</h3>
                      <p className="text-muted-foreground">(11) 3456-7890</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold">Endereço</h3>
                      <p className="text-muted-foreground">
                        Av. Paulista, 1000 - Bela Vista
                        <br />
                        São Paulo - SP, 01310-100
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Assunto"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Mensagem"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="min-h-[150px]"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              <span className="font-bold text-lg">
                <span className="text-yellow-500">Meu</span>
                <span className="text-purple-600">Desconto</span>
              </span>
              <nav className="flex gap-4 sm:gap-6">
                <a href="/about" className="text-sm font-medium hover:underline">
                  Sobre nós
                </a>
                <a href="/contact" className="text-sm font-medium hover:underline">
                  Contato
                </a>
                <a href="/terms" className="text-sm font-medium hover:underline">
                  Termos
                </a>
                <a href="/privacy" className="text-sm font-medium hover:underline">
                  Privacidade
                </a>
              </nav>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Real Soluções. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

