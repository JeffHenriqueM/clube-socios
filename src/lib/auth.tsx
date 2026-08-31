import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { lerBanco, useBanco } from '../data/store';
import type { Usuario } from '../types';

const CHAVE_SESSAO = 'clube-socios:sessao';

interface AuthCtx {
  usuario: Usuario | null;
  entrar: (email: string, senha: string) => { ok: boolean; erro?: string };
  sair: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const banco = useBanco();
  const [usuarioId, setUsuarioId] = useState<string | null>(
    () => localStorage.getItem(CHAVE_SESSAO),
  );

  const valor = useMemo<AuthCtx>(() => {
    const usuario = banco.usuarios.find((u) => u.id === usuarioId && u.ativo) ?? null;
    return {
      usuario,
      entrar(email, senha) {
        const alvo = lerBanco().usuarios.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!alvo) return { ok: false, erro: 'E-mail não encontrado.' };
        if (!alvo.ativo) return { ok: false, erro: 'Acesso desativado.' };
        if (alvo.senha !== senha) return { ok: false, erro: 'Senha incorreta.' };
        localStorage.setItem(CHAVE_SESSAO, alvo.id);
        setUsuarioId(alvo.id);
        return { ok: true };
      },
      sair() {
        localStorage.removeItem(CHAVE_SESSAO);
        setUsuarioId(null);
      },
    };
  }, [banco.usuarios, usuarioId]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
