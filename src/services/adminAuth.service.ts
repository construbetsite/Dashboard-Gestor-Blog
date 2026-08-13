import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type AdminLoginResponse = {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    nome?: string;
    email?: string;
    isAdmin: boolean;
  };
  message?: string;
};

export async function adminLogin(email: string, senha: string) {
  const url = `${apiBase}/api/auth/admin/login`;

  const res = await axios.post<AdminLoginResponse>(url, { email, senha });
  return res.data;
}

