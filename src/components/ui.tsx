import type { ReactNode } from 'react';
import { NIVEIS, type Nivel } from '../types';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Titulo({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold text-slate-900">{children}</h1>
      {acao}
    </div>
  );
}

export function NivelBadge({ nivel }: { nivel?: Nivel }) {
  if (!nivel) return null;
  const info = NIVEIS[nivel];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${info.cor}`}>
      {info.label}
    </span>
  );
}

export function Estrelas({ nota, tamanho = 'text-base' }: { nota: number | null; tamanho?: string }) {
  if (nota === null) return <span className="text-sm text-slate-400">Sem avaliações</span>;
  const cheias = Math.round(nota);
  return (
    <span className={`inline-flex items-center gap-1 ${tamanho}`}>
      <span className="text-amber-500">{'★'.repeat(cheias)}{'☆'.repeat(5 - cheias)}</span>
      <span className="text-sm font-medium text-slate-600">{nota.toFixed(1)}</span>
    </span>
  );
}

export function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

export const botaoCls =
  'inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50';

export const botaoSecCls =
  'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50';

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
