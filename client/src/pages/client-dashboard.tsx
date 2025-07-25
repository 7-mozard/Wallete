import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { TransferModal } from "@/components/TransferModal";
import { useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, ShoppingCart, Plus, History, User, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [showTransferModal, setShowTransferModal] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-white" />;
      case "transfer":
        return <ArrowUpRight className="h-4 w-4 text-white" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-white" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-white" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-500";
      case "transfer":
        return "bg-red-500";
      case "purchase":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="client" />

      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                )}
              </button>

              <div className="ml-3 flex items-center">
                <span className="ml-3 text-gray-700 text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="h-8 w-8 rounded-full bg-primary ml-2 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-8">
          {/* Dashboard Stats */}
          <div className="bg-white px-4 py-6 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Balance Card */}
              <div className="bg-gradient-to-r from-primary to-primary/80 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Wallet className="text-white text-2xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-white truncate">Solde Total</dt>
                        <dd className="text-3xl font-bold text-white">
                          {wallet ? `${wallet.balanceFC} FC` : "0.00 FC"}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ArrowUpRight className="text-green-500 text-2xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Transactions ce mois</dt>
                        <dd className="text-3xl font-bold text-gray-900">{transactions.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <History className="text-yellow-500 text-2xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Dernière activité</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {transactions.length > 0
                            ? formatDistanceToNow(new Date(transactions[0].createdAt), {
                                addSuffix: true,
                                locale: fr,
                              })
                            : "Aucune activité"}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                onClick={() => setShowTransferModal(true)}
                className="h-auto p-6 flex flex-col items-start bg-white text-gray-900 border border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                variant="outline"
              >
                <div className="rounded-lg inline-flex p-3 bg-primary/10 text-primary ring-4 ring-white mb-4">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium">Transférer</h3>
                <p className="mt-2 text-sm text-gray-500">Envoyer de l'argent à un autre utilisateur</p>
              </Button>

              <Button
                className="h-auto p-6 flex flex-col items-start bg-white text-gray-900 border border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                variant="outline"
              >
                <div className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white mb-4">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium">Boutique</h3>
                <p className="mt-2 text-sm text-gray-500">Acheter des articles avec votre solde</p>
              </Button>

              <Button
                className="h-auto p-6 flex flex-col items-start bg-white text-gray-900 border border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                variant="outline"
              >
                <div className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-600 ring-4 ring-white mb-4">
                  <Plus className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium">Dépôt</h3>
                <p className="mt-2 text-sm text-gray-500">Contacter l'admin pour un dépôt</p>
              </Button>

              <Button
                className="h-auto p-6 flex flex-col items-start bg-white text-gray-900 border border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                variant="outline"
              >
                <div className="rounded-lg inline-flex p-3 bg-gray-50 text-gray-600 ring-4 ring-white mb-4">
                  <History className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium">Historique</h3>
                <p className="mt-2 text-sm text-gray-500">Voir toutes vos transactions</p>
              </Button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Transactions récentes</h3>
                <div className="flow-root">
                  <ul className="-mb-8 space-y-6">
                    {transactions.slice(0, 3).map((transaction: any, index: number) => (
                      <li key={transaction.id}>
                        <div className="relative pb-8">
                          {index !== transactions.slice(0, 3).length - 1 && (
                            <span
                              className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getTransactionColor(transaction.type)}`}>
                                {getTransactionIcon(transaction.type)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">{transaction.description}</p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <div className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} {transaction.currency}
                                </div>
                                <time>
                                  {formatDistanceToNow(new Date(transaction.createdAt), {
                                    addSuffix: true,
                                    locale: fr,
                                  })}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        currentBalance={wallet ? Number(wallet.balanceFC) : 0}
      />
    </div>
  );
}
