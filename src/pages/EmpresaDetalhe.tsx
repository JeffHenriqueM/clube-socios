import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inserir, novoId, useBanco } from '../data/store';
import { useAuth } from '../lib/auth';
import { Campo, Card, Estrelas, Titulo, Vazio, botaoCls, inputCls } from '../components/ui';
import { avaliacoesDaEmpresa, dataCurta, mediaNotas, servicosDaEmpresa } from '../lib/util';
import { CATEGORIAS, brl, descontoDoNivel, precoComDesconto, type Avaliacao } from '../types';

export default function EmpresaDetalhe() {
  const { id = '' } = useParams();
  const banco = useBanco();
  const { usuario } = useAuth();
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');

  const empresa = banco.empresas.find((e) => e.id === id);
  if (!empresa) {
    return (
      <>
        <Titulo>Parceiro não encontrado</Titulo>
        <Link className="text-emerald-700" to="/parceiros">
          Voltar para parceiros
        </Link>
      </>
    );
  }

  const servicos = servicosDaEmpresa(banco, empresa.id).filter((s) => s.ativo);
  const avaliacoes = avaliacoesDaEmpresa(banco, empresa.id);
  const jaAvaliou = avaliacoes.some((a) => a.autorId === usuario?.id);
  const podeAvaliar = usuario && (usuario.papel === 'socio' || usuario.papel === 'cliente');

  function enviarAvaliacao(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !empresa) return;
    if (!comentario.trim()) {
      toast.error('Escreva um comentário.');
      return;
    }
    const nova: Avaliacao = {
      id: novoId('a'),
      empresaId: empresa.id,
      autorId: usuario.id,
      autorNome: usuario.nome,
      nota,
      comentario: comentario.trim(),
      criadoEm: new Date().toISOString(),
    };
    inserir('avaliacoes', nova);
    setComentario('');
    setNota(5);
    toast.success('Avaliação publicada.');
  }

  return (
    <>
      <Link className="mb-3 inline-block text-sm text-slate-500 hover:text-slate-800" to="/parceiros">
        ← Parceiros
      </Link>
      <Titulo>{empresa.nome}</Titulo>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">
              {CATEGORIAS.find((c) => c.id === empresa.categoria)?.label} · {empresa.cidade}
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{empresa.descricao}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              {empresa.telefone && <span>Tel: {empresa.telefone}</span>}
              {empresa.whatsapp && (
                <a
                  className="font-medium text-emerald-700 hover:underline"
                  href={`https://wa.me/${empresa.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Falar no WhatsApp
                </a>
              )}
              {empresa.site && (
                <a className="font-medium text-emerald-700 hover:underline" href={empresa.site} target="_blank" rel="noreferrer">
                  Site
                </a>
              )}
            </div>
          </div>
          <Estrelas nota={mediaNotas(avaliacoes)} />
        </div>
      </Card>

      <h2 className="mb-3 text-lg font-semibold text-slate-800">Serviços</h2>
      {servicos.length === 0 ? (
        <Vazio>Este parceiro ainda não publicou serviços.</Vazio>
      ) : (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {servicos.map((s) => {
            const desc = descontoDoNivel(s, usuario?.nivel);
            return (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{s.nome}</div>
                    <p className="mt-1 text-sm text-slate-600">{s.descricao}</p>
                    {(s.local || s.duracao) && (
                      <div className="mt-1 text-xs text-slate-500">
                        {[s.local, s.duracao].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-slate-400 line-through">{brl(s.preco)}</div>
                    <div className="text-lg font-semibold text-emerald-700">
                      {brl(precoComDesconto(s, usuario?.nivel))}
                    </div>
                    <div className="text-xs text-slate-500">{s.unidade}</div>
                    {desc > 0 && (
                      <div className="mt-1 text-xs font-semibold text-emerald-700">-{desc}%</div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-slate-800">Avaliações ({avaliacoes.length})</h2>
      {podeAvaliar && (
        <Card className="mb-4">
          <form onSubmit={enviarAvaliacao} className="space-y-3">
            {jaAvaliou && (
              <p className="text-xs text-slate-500">
                Você já avaliou este parceiro — pode registrar uma nova experiência.
              </p>
            )}
            <Campo label="Nota">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNota(n)}
                    className={`text-2xl leading-none ${n <= nota ? 'text-amber-500' : 'text-slate-300'}`}
                    aria-label={`${n} estrela(s)`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </Campo>
            <Campo label="Comentário">
              <textarea
                className={inputCls}
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Como foi a experiência?"
              />
            </Campo>
            <button className={botaoCls} type="submit">
              Publicar avaliação
            </button>
          </form>
        </Card>
      )}

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
