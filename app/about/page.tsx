import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, Users, Award, Lightbulb, Target, TrendingUp } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Sobre a <span className="text-purple-600">Real Soluções</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transformando o mercado de cashback no Brasil desde 2010.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter">Nossa História</h2>
                <p className="text-muted-foreground">
                  A Real Soluções foi fundada em 2010 com a missão de transformar a forma como as pessoas economizam em
                  suas compras diárias. Começamos como uma pequena startup em São Paulo e hoje somos líderes no mercado
                  de cashback no Brasil.
                </p>
                <p className="text-muted-foreground">
                  Nossa plataforma MeuDesconto conecta consumidores, varejistas e indústrias em um ecossistema que
                  beneficia todos os envolvidos. Os consumidores economizam em suas compras, os varejistas aumentam suas
                  vendas e as indústrias promovem seus produtos de forma eficiente.
                </p>
                <p className="text-muted-foreground">
                  Ao longo dos anos, desenvolvemos tecnologias proprietárias que nos permitem processar milhões de notas
                  fiscais por mês e distribuir cashback de forma rápida e segura.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col items-start space-y-2 rounded-lg border p-4">
                  <Building className="h-10 w-10 text-purple-600" />
                  <h3 className="text-xl font-bold">Nossa Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    Somos uma empresa de tecnologia focada em soluções inovadoras para o varejo e a indústria.
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-2 rounded-lg border p-4">
                  <Users className="h-10 w-10 text-yellow-500" />
                  <h3 className="text-xl font-bold">Nossa Equipe</h3>
                  <p className="text-sm text-muted-foreground">
                    Contamos com uma equipe multidisciplinar de especialistas em tecnologia, varejo e marketing.
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-2 rounded-lg border p-4">
                  <Award className="h-10 w-10 text-purple-600" />
                  <h3 className="text-xl font-bold">Nossos Valores</h3>
                  <p className="text-sm text-muted-foreground">
                    Transparência, inovação e foco no cliente são os valores que guiam nossas ações.
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-2 rounded-lg border p-4">
                  <Lightbulb className="h-10 w-10 text-yellow-500" />
                  <h3 className="text-xl font-bold">Nossa Missão</h3>
                  <p className="text-sm text-muted-foreground">
                    Democratizar o acesso a descontos e cashback para todos os consumidores brasileiros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Por que escolher a Real Soluções?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Somos líderes no mercado de cashback no Brasil e oferecemos soluções inovadoras para consumidores,
                  varejistas e indústrias.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                  <Target className="h-10 w-10 text-purple-600" />
                  <h3 className="text-xl font-bold">Foco no Cliente</h3>
                  <p className="text-sm text-muted-foreground">
                    Desenvolvemos soluções pensando nas necessidades dos nossos clientes.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                  <TrendingUp className="h-10 w-10 text-yellow-500" />
                  <h3 className="text-xl font-bold">Crescimento Constante</h3>
                  <p className="text-sm text-muted-foreground">
                    Estamos em constante evolução para oferecer as melhores soluções do mercado.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                  <Lightbulb className="h-10 w-10 text-purple-600" />
                  <h3 className="text-xl font-bold">Inovação</h3>
                  <p className="text-sm text-muted-foreground">
                    Investimos em tecnologia para criar soluções inovadoras e eficientes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Pronto para começar?</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Junte-se a milhares de pessoas e empresas que já estão usando o MeuDesconto.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline">
                    <Link href="/contact">Fale Conosco</Link>
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

