import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBanco } from '../data/store';
import { Card, Estrelas, Titulo, Vazio, inputCls } from '../components/ui';
import { avaliacoesDaEmpresa, mediaNotas, servicosDaEmpresa } from '../lib/util';
import { CATEGORIAS, brl, precoComDesconto, type CategoriaEmpresa } from '../types';
import { useAuth } from '../lib/auth';

export default function Parceiros() {
  const banco = useBanco();
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<CategoriaEmpresa | 'todas'>('todas');

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return banco.empresas
      .filter((e) => e.ativo)
      .filter((e) => categoria === 'todas' || e.categoria === categoria)
      .filter(
        (e) =>
          !termo ||
          e.nome.toLowerCase().includes(termo) ||
          e.descricao.toLowerCase().includes(termo) ||
          e.cidade.toLowerCase().includes(termo),
      )
      .map((e) => {
        const servicos = servicosDaEmpresa(banco, e.id).filter((s) => s.ativo);
        const menor = servicos.length
          ? Math.min(...servicos.map((s) => precoComDesconto(s, usuario?.nivel)))
          : null;
        return { empresa: e, nota: mediaNotas(avaliacoesDaEmpresa(banco, e.id)), servicos, menor };
      });
  }, [banco, busca, categoria, usuario?.nivel]);

  return (
    <>
      <Titulo>Parceiros</Titulo>
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Buscar parceiro, cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select
          className={`${inputCls} max-w-[200px]`}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaEmpresa | 'todas')}
        >
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {lista.length === 0 ? (
        <Vazio>Nenhum parceiro encontrado.</Vazio>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map(({ empresa, nota, servicos, menor }) => (
            <Link key={empresa.id} to={`/parceiros/${empresa.id}`}>
              <Card className="h-full hover:border-emerald-300">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{empresa.nome}</div>
                    <div className="text-sm text-slate-500">
                      {CATEGORIAS.find((c) => c.id === empresa.categoria)?.label} · {empresa.cidade}
                    </div>
                  </div>
                  <Estrelas nota={nota} tamanho="text-sm" />
                </div>
                <p className="mt-2 text-sm text-slate-600">{empresa.descricao}</p>
                <div className="mt-3 text-sm text-slate-500">
                  {servicos.length} serviço(s)
                  {menor !== null && (
                    <>
                      {' '}· a partir de{' '}
                      <span className="font-semibold text-emerald-700">{brl(menor)}</span> no seu acesso
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
