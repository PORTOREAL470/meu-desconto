"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Store,
  Package,
  Tag,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
  userTypes: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    userTypes: ["cliente", "varejo", "industria"],
  },
  {
    title: "Financeiro",
    href: "/dashboard/finance",
    icon: CreditCard,
    userTypes: ["cliente", "varejo", "industria"],
  },
  {
    title: "Produtos",
    href: "/dashboard/products",
    icon: Package,
    userTypes: ["varejo", "industria"],
  },
  {
    title: "Promoções",
    href: "/dashboard/promotions",
    icon: Tag,
    userTypes: ["varejo", "industria"],
  },
  {
    title: "Lojas",
    href: "/dashboard/stores",
    icon: Store,
    userTypes: ["industria"],
  },
  {
    title: "Compras",
    href: "/dashboard/purchases",
    icon: ShoppingCart,
    userTypes: ["cliente"],
  },
  {
    title: "Usuários",
    href: "/dashboard/users",
    icon: Users,
    userTypes: ["varejo", "industria"],
  },
  {
    title: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    userTypes: ["cliente", "varejo", "industria"],
  },
]

interface SidebarProps {
  userType: string
}

export function Sidebar({ userType }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const filteredNavItems = navItems.filter((item) => item.userTypes.includes(userType))

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta.",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/dashboard" className="flex items-center" onClick={() => setIsOpen(false)}>
                <span className="font-bold text-lg">
                  <span className="text-yellow-500">Meu</span>
                  <span className="text-purple-600">Desconto</span>
                </span>
              </Link>
            </div>
            <nav className="flex-1 overflow-auto py-4">
              <ul className="grid gap-1 px-2">
                {filteredNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                        pathname === item.href
                          ? "bg-purple-100 text-purple-900 dark:bg-purple-800 dark:text-purple-50"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden h-screen border-r bg-background transition-all duration-300 md:flex md:flex-col",
          isCollapsed ? "md:w-[70px]" : "md:w-[240px]",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className={cn("flex items-center", isCollapsed && "justify-center")}>
            {isCollapsed ? (
              <span className="font-bold text-lg">
                <span className="text-yellow-500">M</span>
                <span className="text-purple-600">D</span>
              </span>
            ) : (
              <span className="font-bold text-lg">
                <span className="text-yellow-500">Meu</span>
                <span className="text-purple-600">Desconto</span>
              </span>
            )}
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="grid gap-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-purple-100 text-purple-900 dark:bg-purple-800 dark:text-purple-50"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sm font-medium text-muted-foreground",
              isCollapsed && "justify-center",
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && "Sair"}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
        </Button>
      </div>
    </>
  )
}

