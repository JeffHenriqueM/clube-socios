import { useState } from 'react';
import toast from 'react-hot-toast';
import { atualizar, useBanco } from '../data/store';
import { useAuth } from '../lib/auth';
import ServicosEditor from '../components/ServicosEditor';
import { Campo, Card, Estrelas, Titulo, Vazio, botaoCls, inputCls } from '../components/ui';
import { avaliacoesDaEmpresa, dataCurta, mediaNotas } from '../lib/util';
import { CATEGORIAS, type CategoriaEmpresa } from '../types';

export default function MinhaEmpresa() {
  const banco = useBanco();
  const { usuario } = useAuth();
  const empresa = banco.empresas.find((e) => e.id === usuario?.empresaId);
  const [form, setForm] = useState(() => ({
    nome: empresa?.nome ?? '',
    categoria: (empresa?.categoria ?? 'servicos') as CategoriaEmpresa,
    descricao: empresa?.descricao ?? '',
    cidade: empresa?.cidade ?? '',
    telefone: empresa?.telefone ?? '',
    whatsapp: empresa?.whatsapp ?? '',
    site: empresa?.site ?? '',
  }));

  if (!empresa) return <Vazio>Seu usuário ainda não está vinculado a uma empresa.</Vazio>;

  const avaliacoes = avaliacoesDaEmpresa(banco, empresa.id);

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!empresa) return;
    atualizar('empresas', empresa.id, {
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      cidade: form.cidade.trim(),
      telefone: form.telefone.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      site: form.site.trim() || undefined,
    });
    toast.success('Dados atualizados.');
  }

  return (
    <>
      <Titulo>Minha empresa</Titulo>

      <Card className="mb-8">
        <form onSubmit={salvar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nome">
              <input className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </Campo>
            <Campo label="Categoria">
              <select
                className={inputCls}
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaEmpresa })}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <Campo label="Descrição">
            <textarea
              className={inputCls}
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Cidade">
              <input className={inputCls} value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </Campo>
            <Campo label="Telefone">
              <input className={inputCls} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </Campo>
            <Campo label="WhatsApp (só números, com DDI)">
              <input className={inputCls} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="5583999990000" />
            </Campo>
            <Campo label="Site">
              <input className={inputCls} value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} placeholder="https://" />
            </Campo>
          </div>
          <button className={botaoCls} type="submit">
            Salvar dados
          </button>
        </form>
      </Card>

      <div className="mb-8">
        <ServicosEditor empresaId={empresa.id} />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-800">
        Avaliações recebidas <Estrelas nota={mediaNotas(avaliacoes)} tamanho="text-sm" />
      </h2>
      {avaliacoes.length === 0 ? (
        <Vazio>Ainda sem avaliações.</Vazio>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map((a) => (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{a.autorNome}</span>
                <div className="flex items-center gap-3">
                  <Estrelas nota={a.nota} tamanho="text-sm" />
                  <span className="text-xs text-slate-400">{dataCurta(a.criadoEm)}</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">{a.comentario}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
