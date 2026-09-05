import { useSyncExternalStore } from 'react';
import type { Banco } from '../types';
import { seed } from './seed';

const CHAVE = 'programa-indica:banco:v1';

/**
 * Camada de dados do protótipo.
 *
 * Tudo que toca persistência mora aqui: as telas só leem `useBanco()` e chamam
 * as funções de mutação. Na migração para o Firestore, este arquivo é reescrito
 * (cache alimentado por `onSnapshot`, mutações viram `setDoc`/`updateDoc`) e
 * nenhuma tela precisa mudar.
 */

let cache: Banco = carregar();
const ouvintes = new Set<() => void>();

function carregar(): Banco {
  if (typeof localStorage === 'undefined') return structuredClone(seed);
  const bruto = localStorage.getItem(CHAVE);
  if (!bruto) return structuredClone(seed);
  try {
    const salvo = JSON.parse(bruto) as Partial<Banco>;
    return {
      usuarios: salvo.usuarios ?? [],
      empresas: salvo.empresas ?? [],
      servicos: salvo.servicos ?? [],
      avaliacoes: salvo.avaliacoes ?? [],
      indicacoes: salvo.indicacoes ?? [],
    };
  } catch {
    return structuredClone(seed);
  }
}

function persistir(proximo: Banco) {
  cache = proximo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(proximo));
  } catch {
    /* modo privado / cota cheia: segue só em memória */
  }
  ouvintes.forEach((fn) => fn());
}

function inscrever(fn: () => void) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export function useBanco(): Banco {
  return useSyncExternalStore(inscrever, () => cache, () => cache);
}

export function lerBanco(): Banco {
  return cache;
}

export function resetarBanco() {
  persistir(structuredClone(seed));
}

export function novoId(prefixo: string): string {
  return `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

type Colecao = keyof Banco;
type Item<C extends Colecao> = Banco[C][number];

export function inserir<C extends Colecao>(colecao: C, item: Item<C>) {
  persistir({ ...cache, [colecao]: [...cache[colecao], item] } as Banco);
}

export function atualizar<C extends Colecao>(colecao: C, id: string, campos: Partial<Item<C>>) {
  const lista = (cache[colecao] as Item<C>[]).map((it) =>
    it.id === id ? { ...it, ...campos } : it,
  );
  persistir({ ...cache, [colecao]: lista } as Banco);
}

export function remover<C extends Colecao>(colecao: C, id: string) {
  const lista = (cache[colecao] as Item<C>[]).filter((it) => it.id !== id);
  persistir({ ...cache, [colecao]: lista } as Banco);
}
