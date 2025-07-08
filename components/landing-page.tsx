"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, ShoppingCart, Store, Factory } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"

export function LandingPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [userType, setUserType] = useState("cliente")

  const handleSignUp = () => {
    // Redirecionar para a página de cadastro com os dados preenchidos
    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&type=${userType}`
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
                  <span className="text-yellow-500">Meu</span>
                  <span className="text-purple-600">Desconto</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Economize em suas compras com cashback instantâneo em produtos de supermercado.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Tabs defaultValue="cliente" className="w-full" onValueChange={setUserType}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cliente">Cliente</TabsTrigger>
                    <TabsTrigger value="varejo">Varejo</TabsTrigger>
                    <TabsTrigger value="industria">Indústria</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cliente" className="space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-medium">Para Clientes</h3>
                        </div>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Receba cashback em suas compras do dia a dia</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Basta cadastrar suas notas fiscais</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Saque seu dinheiro quando quiser</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="Seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSignUp}>
                        Começar a economizar <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="varejo" className="space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Store className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-medium">Para Supermercados</h3>
                        </div>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Aumente a fidelidade dos seus clientes</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Promova produtos específicos com cashback</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Acesso a dados de comportamento de compra</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Nome da empresa"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="E-mail corporativo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSignUp}>
                        Aumentar vendas <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="industria" className="space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Factory className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-medium">Para Indústrias</h3>
                        </div>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Promova seus produtos diretamente ao consumidor</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Obtenha insights valiosos sobre o consumo</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Aumente a visibilidade da sua marca</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Nome da indústria"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="E-mail corporativo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSignUp}>
                        Impulsionar produtos <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-yellow-100 p-3">
                  <ShoppingCart className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold">Para Clientes</h3>
                <p className="text-muted-foreground">
                  Economize em suas compras diárias com cashback instantâneo. Basta cadastrar suas notas fiscais e
                  receber dinheiro de volta em produtos participantes.
                </p>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-purple-100 p-3">
                  <Store className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Para Supermercados</h3>
                <p className="text-muted-foreground">
                  Aumente a fidelidade dos clientes e impulsione as vendas de produtos específicos. Obtenha insights
                  valiosos sobre o comportamento de compra.
                </p>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-yellow-100 p-3">
                  <Factory className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold">Para Indústrias</h3>
                <p className="text-muted-foreground">
                  Promova seus produtos diretamente ao consumidor final. Aumente a visibilidade da sua marca e obtenha
                  dados valiosos sobre o consumo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Pronto para começar a economizar?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Junte-se a milhares de pessoas que já estão economizando com o MeuDesconto.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline">
                    <Link href="/auth/login">Entrar</Link>
                  </Button>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/auth/signup">Cadastrar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold text-lg">
                  <span className="text-yellow-500">Meu</span>
                  <span className="text-purple-600">Desconto</span>
                </span>
              </Link>
              <nav className="flex gap-4 sm:gap-6">
                <Link href="/about" className="text-sm font-medium hover:underline">
                  Sobre nós
                </Link>
                <Link href="/contact" className="text-sm font-medium hover:underline">
                  Contato
                </Link>
                <Link href="/terms" className="text-sm font-medium hover:underline">
                  Termos
                </Link>
                <Link href="/privacy" className="text-sm font-medium hover:underline">
                  Privacidade
                </Link>
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

