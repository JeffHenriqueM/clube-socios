import { useState } from 'react';
import toast from 'react-hot-toast';
import { atualizar, inserir, novoId, useBanco } from '../data/store';
import { Campo, Card, Vazio, botaoCls, botaoSecCls, inputCls } from '../components/ui';
import { NIVEIS, brl, type Nivel, type Servico } from '../types';

const NIVEIS_ORDEM: Nivel[] = ['cliente', 'bronze', 'prata', 'ouro', 'integral'];

interface Form {
  nome: string;
  descricao: string;
  tipo: 'servico' | 'passeio';
  preco: string;
  unidade: string;
  duracao: string;
  local: string;
  descontos: Record<string, string>;
}

const FORM_VAZIO: Form = {
  nome: '',
  descricao: '',
  tipo: 'servico',
  preco: '',
  unidade: 'por pessoa',
  duracao: '',
  local: '',
  descontos: {},
};

function paraForm(s: Servico): Form {
  return {
    nome: s.nome,
    descricao: s.descricao,
    tipo: s.tipo,
    preco: String(s.preco),
    unidade: s.unidade,
    duracao: s.duracao ?? '',
    local: s.local ?? '',
    descontos: Object.fromEntries(
      Object.entries(s.descontos).map(([k, v]) => [k, String(v)]),
    ),
  };
}

export default function ServicosEditor({ empresaId }: { empresaId: string }) {
  const banco = useBanco();
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(FORM_VAZIO);
  const [aberto, setAberto] = useState(false);

  const servicos = banco.servicos.filter((s) => s.empresaId === empresaId);

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setAberto(true);
  }

  function abrirEdicao(s: Servico) {
    setEditando(s.id);
    setForm(paraForm(s));
    setAberto(true);
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    const preco = Number(form.preco.replace(',', '.'));
    if (!form.nome.trim() || !Number.isFinite(preco) || preco < 0) {
      toast.error('Informe nome e preço válidos.');
      return;
    }
    const descontos: Partial<Record<Nivel, number>> = {};
    for (const [nivel, valor] of Object.entries(form.descontos)) {
      const n = Number(valor);
      if (valor !== '' && Number.isFinite(n)) descontos[nivel as Nivel] = n;
    }
    const campos = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      tipo: form.tipo,
      preco,
      unidade: form.unidade.trim() || 'por pessoa',
      duracao: form.duracao.trim() || undefined,
      local: form.local.trim() || undefined,
      descontos,
    };
    if (editando) {
      atualizar('servicos', editando, campos);
      toast.success('Serviço atualizado.');
    } else {
      inserir('servicos', {
        id: novoId('s'),
        empresaId,
        ativo: true,
        criadoEm: new Date().toISOString(),
        ...campos,
      });
      toast.success('Serviço publicado.');
    }
    setAberto(false);
    setEditando(null);
    setForm(FORM_VAZIO);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Serviços e passeios</h2>
        <button className={botaoCls} onClick={abrirNovo}>
          Novo serviço
        </button>
      </div>

      {aberto && (
        <Card className="mb-4">
          <form onSubmit={salvar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nome">
                <input
                  className={inputCls}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </Campo>
              <Campo label="Tipo">
                <select
                  className={inputCls}
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as 'servico' | 'passeio' })}
                >
                  <option value="servico">Serviço</option>
                  <option value="passeio">Passeio</option>
                </select>
              </Campo>
            </div>
            <Campo label="Descrição">
              <textarea
                className={inputCls}
                rows={2}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Preço cheio (R$)">
                <input
                  className={inputCls}
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  inputMode="decimal"
                  required
                />
              </Campo>
              <Campo label="Unidade">
                <input
                  className={inputCls}
                  value={form.unidade}
                  onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                  placeholder="por pessoa, por trecho..."
                />
              </Campo>
            </div>
            {form.tipo === 'passeio' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Duração">
                  <input
                    className={inputCls}
                    value={form.duracao}
                    onChange={(e) => setForm({ ...form, duracao: e.target.value })}
                    placeholder="3h"
                  />
                </Campo>
                <Campo label="Local de saída">
                  <input
                    className={inputCls}
                    value={form.local}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                  />
                </Campo>
              </div>
            )}
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Desconto por nível (%) — em branco usa o padrão do nível
              </span>
              <div className="grid gap-3 sm:grid-cols-5">
                {NIVEIS_ORDEM.map((n) => (
                  <label key={n} className="block">
                    <span className="mb-1 block text-xs text-slate-500">
                      {NIVEIS[n].label} ({NIVEIS[n].descontoPadrao}%)
                    </span>
                    <input
                      className={inputCls}
                      value={form.descontos[n] ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, descontos: { ...form.descontos, [n]: e.target.value } })
                      }
                      inputMode="numeric"
                      placeholder="padrão"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className={botaoCls} type="submit">
                {editando ? 'Salvar' : 'Publicar'}
              </button>
              <button className={botaoSecCls} type="button" onClick={() => setAberto(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {servicos.length === 0 ? (
        <Vazio>Nenhum serviço cadastrado.</Vazio>
      ) : (
        <div className="space-y-3">
          {servicos.map((s) => (
            <Card key={s.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{s.nome}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {s.tipo === 'passeio' ? 'passeio' : 'serviço'}
                    </span>
                    {!s.ativo && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                        inativo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{s.descricao}</p>
                  <div className="mt-1 text-sm text-slate-500">
                    {brl(s.preco)} {s.unidade}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className={botaoSecCls} onClick={() => abrirEdicao(s)}>
                    Editar
                  </button>
                  <button
                    className={botaoSecCls}
                    onClick={() => atualizar('servicos', s.id, { ativo: !s.ativo })}
                  >
                    {s.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
