export type Nivel = 'bronze' | 'prata' | 'ouro' | 'integral' | 'cliente';

export type Papel = 'admin' | 'socio' | 'cliente' | 'empresa';

export interface NivelInfo {
  id: Nivel;
  label: string;
  ordem: number;
  /** desconto padrão (%) aplicado quando o serviço não define um específico */
  descontoPadrao: number;
  cor: string;
  descricao: string;
}

export const NIVEIS: Record<Nivel, NivelInfo> = {
  cliente: {
    id: 'cliente',
    label: 'Cliente',
    ordem: 0,
    descontoPadrao: 5,
    cor: 'bg-slate-200 text-slate-700 border-slate-300',
    descricao: 'Acesso de cliente indicado por um sócio.',
  },
  bronze: {
    id: 'bronze',
    label: 'Bronze',
    ordem: 1,
    descontoPadrao: 10,
    cor: 'bg-amber-100 text-amber-800 border-amber-300',
    descricao: 'Acesso de entrada do sócio.',
  },
  prata: {
    id: 'prata',
    label: 'Prata',
    ordem: 2,
    descontoPadrao: 15,
    cor: 'bg-zinc-200 text-zinc-700 border-zinc-400',
    descricao: 'Acesso intermediário.',
  },
  ouro: {
    id: 'ouro',
    label: 'Ouro',
    ordem: 3,
    descontoPadrao: 20,
    cor: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    descricao: 'Acesso premium.',
  },
  integral: {
    id: 'integral',
    label: 'Integral',
    ordem: 4,
    descontoPadrao: 30,
    cor: 'bg-emerald-100 text-emerald-800 border-emerald-400',
    descricao: 'Acesso completo, maior desconto em todos os parceiros.',
  },
};

export const NIVEIS_SOCIO: Nivel[] = ['bronze', 'prata', 'ouro', 'integral'];

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  papel: Papel;
  /** senha em texto puro: protótipo local. Vira Firebase Auth na migração. */
  senha: string;
  nivel?: Nivel;
  /** empresa que este usuário administra (papel === 'empresa') */
  empresaId?: string;
  /** sócio que indicou este cliente */
  indicadoPor?: string;
  ativo: boolean;
  criadoEm: string;
}

export type CategoriaEmpresa =
  | 'passeio'
  | 'gastronomia'
  | 'hospedagem'
  | 'transporte'
  | 'bem-estar'
  | 'servicos'
  | 'outros';

export const CATEGORIAS: { id: CategoriaEmpresa; label: string }[] = [
  { id: 'passeio', label: 'Passeios' },
  { id: 'gastronomia', label: 'Gastronomia' },
  { id: 'hospedagem', label: 'Hospedagem' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'bem-estar', label: 'Bem-estar' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'outros', label: 'Outros' },
];

export interface Empresa {
  id: string;
  nome: string;
  categoria: CategoriaEmpresa;
  descricao: string;
  cidade: string;
  telefone?: string;
  whatsapp?: string;
  site?: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Servico {
  id: string;
  empresaId: string;
  nome: string;
  descricao: string;
  tipo: 'servico' | 'passeio';
  /** preço cheio, em reais */
  preco: number;
  unidade: string;
  /** desconto (%) por nível; ausente = usa o descontoPadrao do nível */
  descontos: Partial<Record<Nivel, number>>;
  /** só passeios */
  duracao?: string;
  local?: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Avaliacao {
  id: string;
  empresaId: string;
  servicoId?: string;
  autorId: string;
  autorNome: string;
  nota: number;
  comentario: string;
  criadoEm: string;
}

export type StatusIndicacao = 'pendente' | 'aprovada' | 'recusada';

export interface Indicacao {
  id: string;
  socioId: string;
  socioNome: string;
  nome: string;
  email: string;
  telefone?: string;
  observacao?: string;
  status: StatusIndicacao;
  /** usuário cliente criado quando a indicação é aprovada */
  clienteId?: string;
  criadoEm: string;
}

export interface Banco {
  usuarios: Usuario[];
  empresas: Empresa[];
  servicos: Servico[];
  avaliacoes: Avaliacao[];
  indicacoes: Indicacao[];
}

/** desconto (%) que um nível tem num serviço */
export function descontoDoNivel(servico: Servico, nivel?: Nivel): number {
  if (!nivel) return 0;
  const especifico = servico.descontos[nivel];
  return especifico ?? NIVEIS[nivel].descontoPadrao;
}

export function precoComDesconto(servico: Servico, nivel?: Nivel): number {
  const desc = descontoDoNivel(servico, nivel);
  return Math.round(servico.preco * (1 - desc / 100) * 100) / 100;
}

export function brl(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
