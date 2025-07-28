import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = (path: string) => window.location.href = path;

  // Fonction pour récupérer le token
  const getToken = () => localStorage.getItem("token");

  // Requête pour vérifier l'authentification
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!getToken(),
    staleTime: 1000 * 60 * 5, // Cache pendant 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation pour le login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      if (!response.ok) {
        throw new Error("Erreur de connexion");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      // Redirection après login
      navigate("/");
    },
    onError: (error) => {
      console.error("Erreur de login:", error);
      // Redirection vers la page de login en cas d'erreur
      navigate("/");
    },
  });

  // Mutation pour l'inscription
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      if (!response.ok) {
        throw new Error("Erreur d'inscription");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      // Redirection après inscription
      navigate("/");
    },
    onError: (error) => {
      console.error("Erreur d'inscription:", error);
      // Redirection vers la page d'inscription en cas d'erreur
      navigate("/register");
    },
  });

  // Fonction pour le logout
  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
    // Redirection vers la page de login après logout
    navigate("/");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
