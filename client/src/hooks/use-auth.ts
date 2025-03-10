
// مكان مؤقت للـ hook
export function useAuth() {
  return {
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: async () => {}
  };
}
