import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { Users, DollarSign, TrendingUp, ShoppingCart, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [createMoneyForm, setCreateMoneyForm] = useState({
    amount: "",
    currency: "FC" as "FC" | "USD",
  });

  const [creditForm, setCreditForm] = useState({
    userEmail: "",
    amount: "",
    currency: "FC" as "FC" | "USD",
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const createMoneyMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string }) => {
      const response = await apiRequest("POST", "/api/admin/create-money", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Monnaie créée",
        description: `${createMoneyForm.amount} ${createMoneyForm.currency} ont été injectés dans le système.`,
      });
      setCreateMoneyForm({ amount: "", currency: "FC" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de monnaie",
        variant: "destructive",
      });
    },
  });

  const creditAccountMutation = useMutation({
    mutationFn: async (data: { userEmail: string; amount: number; currency: string }) => {
      const response = await apiRequest("POST", "/api/admin/credit-account", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Compte crédité",
        description: "Le compte client a été crédité avec succès.",
      });
      setCreditForm({ userEmail: "", amount: "", currency: "FC" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du crédit de compte",
        variant: "destructive",
      });
    },
  });

  const handleCreateMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createMoneyForm.amount || parseFloat(createMoneyForm.amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }
    createMoneyMutation.mutate({
      amount: parseFloat(createMoneyForm.amount),
      currency: createMoneyForm.currency,
    });
  };

  const handleCreditAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditForm.userEmail || !creditForm.amount || parseFloat(creditForm.amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs avec des valeurs valides",
        variant: "destructive",
      });
      return;
    }
    creditAccountMutation.mutate({
      userEmail: creditForm.userEmail,
      amount: parseFloat(creditForm.amount),
      currency: creditForm.currency,
    });
  };

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      case "purchase":
        return "bg-yellow-100 text-yellow-800";
      case "money_creation":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Dépôt";
      case "transfer":
        return "Transfert";
      case "purchase":
        return "Achat";
      case "money_creation":
        return "Création";
      default:
        return type;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="admin" />

      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Admin Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Bienvenu administrateur général</h1>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-gray-700 font-medium">Administrateur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Content */}
        <main className="flex-1 pb-8">
          {/* Admin Stats */}
          <div className="bg-white px-4 py-6 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="text-primary text-2xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs Actifs</dt>
                        <dd className="text-3xl font-bold text-gray-900">--</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="text-green-500 text-2xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monnaie en Circulation</dt>
                        <dd className="text-2xl font-bold text-gray-900">--</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="text-yellow-500 text-2xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Transactions/Jour</dt>
                        <dd className="text-3xl font-bold text-gray-900">{transactions.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingCart className="text-red-500 text-2xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Ventes Boutique</dt>
                        <dd className="text-2xl font-bold text-gray-900">--</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Create Money Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Créer de la monnaie électronique
                  </h3>
                  <form onSubmit={handleCreateMoney} className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700">
                        Montant à créer
                      </Label>
                      <div className="mt-1 flex">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={createMoneyForm.amount}
                          onChange={(e) =>
                            setCreateMoneyForm({ ...createMoneyForm, amount: e.target.value })
                          }
                          placeholder="0.00"
                          className="flex-1 mr-2"
                        />
                        <Select
                          value={createMoneyForm.currency}
                          onValueChange={(value: "FC" | "USD") =>
                            setCreateMoneyForm({ ...createMoneyForm, currency: value })
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FC">FC</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600"
                      disabled={createMoneyMutation.isPending}
                    >
                      {createMoneyMutation.isPending ? "Création..." : "Créer la monnaie"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Credit Account Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Créditer un compte client
                  </h3>
                  <form onSubmit={handleCreditAccount} className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700">
                        Email du client
                      </Label>
                      <Input
                        type="email"
                        value={creditForm.userEmail}
                        onChange={(e) =>
                          setCreditForm({ ...creditForm, userEmail: e.target.value })
                        }
                        placeholder="client@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700">
                        Montant du dépôt
                      </Label>
                      <div className="mt-1 flex">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={creditForm.amount}
                          onChange={(e) =>
                            setCreditForm({ ...creditForm, amount: e.target.value })
                          }
                          placeholder="0.00"
                          className="flex-1 mr-2"
                        />
                        <Select
                          value={creditForm.currency}
                          onValueChange={(value: "FC" | "USD") =>
                            setCreditForm({ ...creditForm, currency: value })
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FC">FC</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={creditAccountMutation.isPending}
                    >
                      {creditAccountMutation.isPending ? "Crédit..." : "Créditer le compte"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Activité récente du système
                  </h3>
                  <div className="flex space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="deposit">Dépôts</SelectItem>
                        <SelectItem value="transfer">Transferts</SelectItem>
                        <SelectItem value="purchase">Achats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.slice(0, 10).map((transaction: any) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.fromUserId || transaction.toUserId || "Système"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionBadgeColor(
                                transaction.type
                              )}`}
                            >
                              {getTransactionLabel(transaction.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.amount} {transaction.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDistanceToNow(new Date(transaction.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Complété
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
