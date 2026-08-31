import type { Avaliacao, Banco, Empresa, Servico } from '../types';

export function mediaNotas(avaliacoes: Avaliacao[]): number | null {
  if (!avaliacoes.length) return null;
  const soma = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
  return Math.round((soma / avaliacoes.length) * 10) / 10;
}

export function avaliacoesDaEmpresa(banco: Banco, empresaId: string): Avaliacao[] {
  return banco.avaliacoes
    .filter((a) => a.empresaId === empresaId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export function servicosDaEmpresa(banco: Banco, empresaId: string): Servico[] {
  return banco.servicos.filter((s) => s.empresaId === empresaId);
}

export function empresaPorId(banco: Banco, id: string): Empresa | undefined {
  return banco.empresas.find((e) => e.id === id);
}

export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}
