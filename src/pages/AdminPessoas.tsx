import { useState } from 'react';
import toast from 'react-hot-toast';
import { atualizar, inserir, novoId, useBanco } from '../data/store';
import { Campo, Card, NivelBadge, Titulo, botaoCls, botaoSecCls, inputCls } from '../components/ui';
import { dataCurta } from '../lib/util';
import { NIVEIS_SOCIO, type Nivel, type Papel, type Usuario } from '../types';

const VAZIO = { nome: '', email: '', telefone: '', nivel: 'bronze' as Nivel };

const ROTULO_PAPEL: Record<Papel, string> = {
  admin: 'Admin',
  socio: 'Sócio',
  cliente: 'Cliente',
  empresa: 'Parceiro',
};

export default function AdminPessoas() {
  const banco = useBanco();
  const [form, setForm] = useState(VAZIO);
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState<Papel | 'todos'>('todos');

  function criarSocio(e: React.FormEvent) {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (banco.usuarios.some((u) => u.email.toLowerCase() === email)) {
      toast.error('Já existe um acesso com esse e-mail.');
      return;
    }
    const socio: Usuario = {
      id: novoId('u'),
      nome: form.nome.trim(),
      email,
      telefone: form.telefone.trim() || undefined,
      papel: 'socio',
      senha: '123456',
      nivel: form.nivel,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    inserir('usuarios', socio);
    setForm(VAZIO);
    setAberto(false);
    toast.success('Sócio cadastrado (senha 123456).');
  }

  const lista = banco.usuarios.filter((u) => filtro === 'todos' || u.papel === filtro);

  return (
    <>
      <Titulo
        acao={
          <button className={botaoCls} onClick={() => setAberto((v) => !v)}>
            {aberto ? 'Fechar' : 'Novo sócio'}
          </button>
        }
      >
        Pessoas
      </Titulo>

      {aberto && (
        <Card className="mb-6 max-w-lg">
          <form onSubmit={criarSocio} className="space-y-4">
            <Campo label="Nome">
              <input className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </Campo>
            <Campo label="E-mail">
              <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Campo>
            <Campo label="Telefone">
              <input className={inputCls} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </Campo>
            <Campo label="Nível de acesso">
              <select
                className={inputCls}
                value={form.nivel}
                onChange={(e) => setForm({ ...form, nivel: e.target.value as Nivel })}
              >
                {NIVEIS_SOCIO.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Campo>
            <button className={botaoCls} type="submit">
              Cadastrar sócio
            </button>
          </form>
        </Card>
      )}

      <select
        className={`${inputCls} mb-4 max-w-[200px]`}
        value={filtro}
        onChange={(e) => setFiltro(e.target.value as Papel | 'todos')}
      >
        <option value="todos">Todos os papéis</option>
        <option value="socio">Sócios</option>
        <option value="cliente">Clientes</option>
        <option value="empresa">Parceiros</option>
        <option value="admin">Admins</option>
      </select>

      <div className="space-y-3">
        {lista.map((u) => (
          <Card key={u.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{u.nome}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {ROTULO_PAPEL[u.papel]}
                  </span>
                  <NivelBadge nivel={u.nivel} />
                  {!u.ativo && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">inativo</span>
                  )}
                </div>
                <div className="text-sm text-slate-500">
                  {u.email} · desde {dataCurta(u.criadoEm)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {u.papel === 'socio' && (
                  <select
                    className={`${inputCls} w-32`}
                    value={u.nivel ?? 'bronze'}
                    onChange={(ev) => {
                      atualizar('usuarios', u.id, { nivel: ev.target.value as Nivel });
                      toast.success('Nível atualizado.');
                    }}
                  >
                    {NIVEIS_SOCIO.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                )}
                <button className={botaoSecCls} onClick={() => atualizar('usuarios', u.id, { ativo: !u.ativo })}>
                  {u.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
