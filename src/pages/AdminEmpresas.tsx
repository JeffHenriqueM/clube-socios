import { useState } from 'react';
import toast from 'react-hot-toast';
import { atualizar, inserir, novoId, useBanco } from '../data/store';
import ServicosEditor from '../components/ServicosEditor';
import { Campo, Card, Estrelas, Titulo, Vazio, botaoCls, botaoSecCls, inputCls } from '../components/ui';
import { avaliacoesDaEmpresa, mediaNotas } from '../lib/util';
import { CATEGORIAS, type CategoriaEmpresa, type Empresa, type Usuario } from '../types';

const VAZIO = {
  nome: '',
  categoria: 'servicos' as CategoriaEmpresa,
  descricao: '',
  cidade: '',
  telefone: '',
  whatsapp: '',
  site: '',
  emailAcesso: '',
};

export default function AdminEmpresas() {
  const banco = useBanco();
  const [form, setForm] = useState(VAZIO);
  const [aberto, setAberto] = useState(false);
  const [expandida, setExpandida] = useState<string | null>(null);

  function criar(e: React.FormEvent) {
    e.preventDefault();
    const empresa: Empresa = {
      id: novoId('e'),
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      cidade: form.cidade.trim(),
      telefone: form.telefone.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      site: form.site.trim() || undefined,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    inserir('empresas', empresa);

    const email = form.emailAcesso.trim().toLowerCase();
    if (email) {
      if (banco.usuarios.some((u) => u.email.toLowerCase() === email)) {
        toast.error('Empresa criada, mas o e-mail de acesso já está em uso.');
      } else {
        const acesso: Usuario = {
          id: novoId('u'),
          nome: empresa.nome,
          email,
          papel: 'empresa',
          senha: '123456',
          empresaId: empresa.id,
          ativo: true,
          criadoEm: new Date().toISOString(),
        };
        inserir('usuarios', acesso);
      }
    }
    setForm(VAZIO);
    setAberto(false);
    toast.success('Parceiro cadastrado.');
  }

  return (
    <>
      <Titulo
        acao={
          <button className={botaoCls} onClick={() => setAberto((v) => !v)}>
            {aberto ? 'Fechar' : 'Novo parceiro'}
          </button>
        }
      >
        Empresas parceiras
      </Titulo>

      {aberto && (
        <Card className="mb-6">
          <form onSubmit={criar} className="space-y-4">
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
              <textarea className={inputCls} rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Cidade">
                <input className={inputCls} value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </Campo>
              <Campo label="Telefone">
                <input className={inputCls} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </Campo>
              <Campo label="WhatsApp">
                <input className={inputCls} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="5583999990000" />
              </Campo>
              <Campo label="Site">
                <input className={inputCls} value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} placeholder="https://" />
              </Campo>
            </div>
            <Campo label="E-mail de acesso do parceiro (opcional — cria login, senha 123456)">
              <input className={inputCls} type="email" value={form.emailAcesso} onChange={(e) => setForm({ ...form, emailAcesso: e.target.value })} />
            </Campo>
            <button className={botaoCls} type="submit">
              Cadastrar
            </button>
          </form>
        </Card>
      )}

      {banco.empresas.length === 0 ? (
        <Vazio>Nenhuma empresa cadastrada.</Vazio>
      ) : (
        <div className="space-y-3">
          {banco.empresas.map((e) => (
            <Card key={e.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{e.nome}</span>
                    {!e.ativo && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">inativa</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {CATEGORIAS.find((c) => c.id === e.categoria)?.label} · {e.cidade}
                  </div>
                  <div className="mt-1">
                    <Estrelas nota={mediaNotas(avaliacoesDaEmpresa(banco, e.id))} tamanho="text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={botaoSecCls}
                    onClick={() => setExpandida(expandida === e.id ? null : e.id)}
                  >
                    {expandida === e.id ? 'Fechar serviços' : 'Serviços'}
                  </button>
                  <button className={botaoSecCls} onClick={() => atualizar('empresas', e.id, { ativo: !e.ativo })}>
                    {e.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
              {expandida === e.id && (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <ServicosEditor empresaId={e.id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
