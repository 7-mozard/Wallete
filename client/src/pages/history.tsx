import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/Sidebar";
import { ArrowUpRight, ArrowDownLeft, ShoppingCart, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function HistoryPage() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case "transfer":
        return <ArrowUpRight className="h-5 w-5 text-blue-600" />;
      case "purchase":
        return <ShoppingCart className="h-5 w-5 text-yellow-600" />;
      case "money_creation":
        return <DollarSign className="h-5 w-5 text-purple-600" />;
      default:
        return <ArrowUpRight className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge className="bg-green-100 text-green-800">Dépôt</Badge>;
      case "transfer":
        return <Badge className="bg-blue-100 text-blue-800">Transfert</Badge>;
      case "purchase":
        return <Badge className="bg-yellow-100 text-yellow-800">Achat</Badge>;
      case "money_creation":
        return <Badge className="bg-purple-100 text-purple-800">Création</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar userRole="client" />
        <div className="lg:pl-64 flex flex-col flex-1">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement de l'historique...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="client" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Historique des transactions</h1>
              <p className="mt-2 text-gray-600">Consultez toutes vos transactions passées</p>
            </div>

            {transactions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-4xl">📄</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
                  <p className="text-gray-500">Vos transactions apparaîtront ici.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {transaction.description}
                                </p>
                                {getTransactionBadge(transaction.type)}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(transaction.createdAt), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${
                              transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} {transaction.currency}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
