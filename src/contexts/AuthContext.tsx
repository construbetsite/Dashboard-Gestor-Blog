// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Cache para admin
interface AdminCache {
  isAdmin: boolean;
  timestamp: number;
}

const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const adminCache = new Map<string, AdminCache>();

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // ✅ CORRIGIDO: Adicionar valor inicial undefined
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ✅ COM CACHE - Evita múltiplas chamadas
  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    // Verificar cache primeiro
    const cached = adminCache.get(userId);
    if (cached && Date.now() - cached.timestamp < ADMIN_CACHE_TTL) {
      console.log('✅ Admin status do cache:', cached.isAdmin);
      setIsAdmin(cached.isAdmin);
      return cached.isAdmin;
    }

    try {
      console.log('🔍 Verificando admin para:', userId);
      
      // 🔥 VERIFICAR SE O USUÁRIO EXISTE NA TABELA administradores
      // O campo 'id' da tabela administradores é o mesmo que o 'id' do usuário
      const { data, error } = await supabase
        .from('administradores')
        .select('id')  // Busca o id que é igual ao id do usuário
        .eq('id', userId)  // 🔥 Compara com o id do usuário
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao verificar admin:', error);
        setIsAdmin(false);
        adminCache.set(userId, { isAdmin: false, timestamp: Date.now() });
        return false;
      }

      console.log('📊 Dados do admin:', data);

      if (!data) {
        console.log('❌ Usuário NÃO é admin');
        setIsAdmin(false);
        adminCache.set(userId, { isAdmin: false, timestamp: Date.now() });
        return false;
      }

      console.log('✅ Usuário é admin! ID:', data.id);
      setIsAdmin(true);
      adminCache.set(userId, { isAdmin: true, timestamp: Date.now() });
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar admin:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);

  // Verifica admin com debounce
  const checkAdminWithDebounce = useCallback((userId: string) => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    checkTimeoutRef.current = setTimeout(() => {
      checkAdminStatus(userId);
    }, 300);
  }, [checkAdminStatus]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          checkAdminWithDebounce(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [checkAdminStatus, checkAdminWithDebounce]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    setUser(data.user);
    setSession(data.session);
    
    if (data.user) {
      await checkAdminStatus(data.user.id);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        isAdmin, 
        login, 
        logout, 
        getToken,
        checkAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;