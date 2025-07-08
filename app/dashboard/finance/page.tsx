"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, Download } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function FinancePage() {
  const [userType, setUserType] = useState<string>("")
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawMethod, setWithdrawMethod] = useState<string>("pix")
  const [withdrawKey, setWithdrawKey] = useState<string>("")
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Obter tipo de usuário
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single()

        if (profileData) {
          setUserType(profileData.user_type)
        }

        // Obter transações
        const { data: transactionsData } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (transactionsData) {
          setTransactions(transactionsData)

          // Calcular saldo
          const totalBalance = transactionsData.reduce((acc, transaction) => {
            if (transaction.status === "completed") {
              if (transaction.type === "cashback" || transaction.type === "deposit") {
                return acc + transaction.amount
              } else if (transaction.type === "withdrawal") {
                return acc - transaction.amount
              }
            }
            return acc
          }, 0)

          setBalance(totalBalance)
        }
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, informe um valor válido para saque.",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(withdrawAmount) > balance) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não possui saldo suficiente para este saque.",
        variant: "destructive",
      })
      return
    }

    if (!withdrawKey) {
      toast({
        title: "Chave não informada",
        description: "Por favor, informe uma chave para receber o saque.",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error("Usuário não autenticado")

      // Criar nova transação de saque
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: session.user.id,
            type: "withdrawal",
            amount: Number.parseFloat(withdrawAmount),
            status: "pending",
            description: `Saque via ${withdrawMethod}: ${withdrawKey}`,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Solicitação de saque enviada",
        description: "Sua solicitação de saque foi enviada e está em processamento.",
      })

      // Atualizar lista de transações
      setTransactions([data[0], ...transactions])

      // Limpar formulário
      setWithdrawAmount("")
      setWithdrawKey("")
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar saque",
        description: error.message || "Ocorreu um erro ao solicitar o saque. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Solicitar Saque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Saque</DialogTitle>
              <DialogDescription>Informe o valor e o método de saque desejado.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="method">Método de Saque</Label>
                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="bank">Transferência Bancária</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key">{withdrawMethod === "pix" ? "Chave PIX" : "Dados Bancários"}</Label>
                <Input
                  id="key"
                  placeholder={
                    withdrawMethod === "pix" ? "CPF, e-mail, telefone ou chave aleatória" : "Banco, Agência, Conta"
                  }
                  value={withdrawKey}
                  onChange={(e) => setWithdrawKey(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? "Processando..." : "Solicitar Saque"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground">Saldo disponível para saque</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(
                transactions
                  .filter((t) => (t.type === "cashback" || t.type === "deposit") && t.status === "completed")
                  .reduce((acc, t) => acc + t.amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total de cashbacks e depósitos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(
                transactions
                  .filter((t) => t.type === "withdrawal" && t.status === "completed")
                  .reduce((acc, t) => acc + t.amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total de saques realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {formatCurrency(
                transactions
                  .filter((t) => t.status === "pending")
                  .reduce((acc, t) => {
                    if (t.type === "cashback" || t.type === "deposit") {
                      return acc + t.amount
                    } else if (t.type === "withdrawal") {
                      return acc - t.amount
                    }
                    return acc
                  }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">Valores em processamento</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas Transações</TabsTrigger>
          <TabsTrigger value="cashback">Cashbacks</TabsTrigger>
          <TabsTrigger value="withdrawal">Saques</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Visualize todas as suas transações financeiras</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <p>Carregando transações...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-start gap-2">
                        <div
                          className={`rounded-full p-2 ${
                            transaction.type === "cashback"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "withdrawal"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {transaction.type === "cashback" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : transaction.type === "withdrawal" ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.type === "cashback"
                              ? "Cashback"
                              : transaction.type === "withdrawal"
                                ? "Saque"
                                : "Depósito"}
                          </p>
                          <p className="text-sm text-muted-foreground">{transaction.description || "-"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {transaction.type === "withdrawal" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                        <p className="text-xs">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : transaction.status === "pending"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {transaction.status === "completed"
                              ? "Concluído"
                              : transaction.status === "pending"
                                ? "Pendente"
                                : "Falhou"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Exportar Extrato
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="cashback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cashbacks Recebidos</CardTitle>
              <CardDescription>Visualize todos os cashbacks recebidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <p>Carregando cashbacks...</p>
                </div>
              ) : transactions.filter((t) => t.type === "cashback").length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Nenhum cashback encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions
                    .filter((t) => t.type === "cashback")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-start gap-2">
                          <div className="rounded-full p-2 bg-green-100 text-green-600">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Cashback</p>
                            <p className="text-sm text-muted-foreground">{transaction.description || "-"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+{formatCurrency(transaction.amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                          <p className="text-xs">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                transaction.status === "completed"
                                  ? "bg-green-100 text-green-600"
                                  : transaction.status === "pending"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                              }`}
                            >
                              {transaction.status === "completed"
                                ? "Concluído"
                                : transaction.status === "pending"
                                  ? "Pendente"
                                  : "Falhou"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="withdrawal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saques Realizados</CardTitle>
              <CardDescription>Visualize todos os saques solicitados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <p>Carregando saques...</p>
                </div>
              ) : transactions.filter((t) => t.type === "withdrawal").length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Nenhum saque encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions
                    .filter((t) => t.type === "withdrawal")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-start gap-2">
                          <div className="rounded-full p-2 bg-red-100 text-red-600">
                            <ArrowDownRight className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Saque</p>
                            <p className="text-sm text-muted-foreground">{transaction.description || "-"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">-{formatCurrency(transaction.amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                          <p className="text-xs">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                transaction.status === "completed"
                                  ? "bg-green-100 text-green-600"
                                  : transaction.status === "pending"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                              }`}
                            >
                              {transaction.status === "completed"
                                ? "Concluído"
                                : transaction.status === "pending"
                                  ? "Pendente"
                                  : "Falhou"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

