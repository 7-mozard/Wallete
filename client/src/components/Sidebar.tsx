import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Home, 
  ArrowUpRight, 
  ShoppingCart, 
  History, 
  User, 
  Shield, 
  Users, 
  DollarSign, 
  Plus,
  Package,
  BarChart3,
  LogOut
} from "lucide-react";

interface SidebarProps {
  userRole: "client" | "admin";
}

export function Sidebar({ userRole }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const clientNavItems = [
    { href: "/", icon: Home, label: "Tableau de bord" },
    { href: "/transfer", icon: ArrowUpRight, label: "Transférer" },
    { href: "/shop", icon: ShoppingCart, label: "Boutique" },
    { href: "/history", icon: History, label: "Historique" },
    { href: "/profile", icon: User, label: "Profil" },
  ];

  const adminNavItems = [
    { href: "/", icon: Home, label: "Tableau de bord" },
    { href: "/admin/users", icon: Users, label: "Utilisateurs" },
    { href: "/admin/money", icon: DollarSign, label: "Créer Monnaie" },
    { href: "/admin/credit", icon: Plus, label: "Créditer Compte" },
    { href: "/admin/products", icon: Package, label: "Produits" },
    { href: "/admin/transactions", icon: BarChart3, label: "Transactions" },
  ];

  const navItems = userRole === "admin" ? adminNavItems : clientNavItems;
  const brandColor = userRole === "admin" ? "bg-red-500" : "bg-primary";
  const brandIcon = userRole === "admin" ? Shield : Wallet;
  const brandText = userRole === "admin" ? "Admin Panel" : "Wallete";

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className={`h-10 w-10 ${brandColor} rounded-lg flex items-center justify-center`}>
            {userRole === "admin" ? (
              <Shield className="text-white" />
            ) : (
              <Wallet className="text-white" />
            )}
          </div>
          <span className="ml-3 text-xl font-semibold text-gray-900">{brandText}</span>
        </div>

        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const activeClass = userRole === "admin"
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-primary-50 border-primary text-primary";
            const inactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 cursor-pointer ${
                    isActive ? `${activeClass} border-l-4` : `${inactiveClass} border-transparent`
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 px-2 mb-4">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start text-gray-600 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
