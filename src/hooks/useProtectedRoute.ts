import { useAuth } from "./useAuth";

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
  };
}
