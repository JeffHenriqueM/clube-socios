import toast from 'react-hot-toast';
import { atualizar, inserir, novoId, useBanco } from '../data/store';
import { useAuth } from '../lib/auth';
import { Card, Titulo, Vazio, botaoCls, botaoSecCls } from '../components/ui';
import { dataCurta } from '../lib/util';
import type { Indicacao, StatusIndicacao, Usuario } from '../types';

const CORES: Record<StatusIndicacao, string> = {
  pendente: 'bg-amber-100 text-amber-800',
  aprovada: 'bg-emerald-100 text-emerald-800',
  recusada: 'bg-rose-100 text-rose-700',
};

export default function Indicacoes() {
  const banco = useBanco();
  const { usuario } = useAuth();
  if (!usuario) return null;

  const ehAdmin = usuario.papel === 'admin';
  const lista = banco.indicacoes
    .filter((i) => ehAdmin || i.socioId === usuario.id)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  function aprovar(ind: Indicacao) {
    const existente = banco.usuarios.find(
      (u) => u.email.toLowerCase() === ind.email.toLowerCase(),
    );
    if (existente) {
      atualizar('indicacoes', ind.id, { status: 'aprovada', clienteId: existente.id });
      toast.success('Já existia um acesso com esse e-mail — indicação vinculada.');
      return;
    }
    const cliente: Usuario = {
      id: novoId('u'),
      nome: ind.nome,
      email: ind.email,
      telefone: ind.telefone,
      papel: 'cliente',
      senha: '123456',
      nivel: 'cliente',
      indicadoPor: ind.socioId,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    inserir('usuarios', cliente);
    atualizar('indicacoes', ind.id, { status: 'aprovada', clienteId: cliente.id });
    toast.success(`Acesso de cliente criado para ${cliente.nome}.`);
  }

  return (
    <>
      <Titulo>{ehAdmin ? 'Indicações' : 'Minhas indicações'}</Titulo>
      {lista.length === 0 ? (
        <Vazio>Nenhuma indicação por aqui.</Vazio>
      ) : (
        <div className="space-y-3">
          {lista.map((i) => (
            <Card key={i.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{i.nome}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CORES[i.status]}`}>
                      {i.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {i.email}
                    {i.telefone ? ` · ${i.telefone}` : ''}
                  </div>
                  {ehAdmin && (
                    <div className="text-sm text-slate-500">Indicado por {i.socioNome}</div>
                  )}
                  {i.observacao && <p className="mt-1 text-sm text-slate-600">{i.observacao}</p>}
                  <div className="mt-1 text-xs text-slate-400">{dataCurta(i.criadoEm)}</div>
                </div>
                {ehAdmin && i.status === 'pendente' && (
                  <div className="flex gap-2">
                    <button className={botaoCls} onClick={() => aprovar(i)}>
                      Aprovar
                    </button>
                    <button
                      className={botaoSecCls}
                      onClick={() => {
                        atualizar('indicacoes', i.id, { status: 'recusada' });
                        toast('Indicação recusada.');
                      }}
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
