import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBanco } from '../data/store';
import { useAuth } from '../lib/auth';
import { Card, Titulo, Vazio, inputCls } from '../components/ui';
import { empresaPorId } from '../lib/util';
import { brl, descontoDoNivel, precoComDesconto } from '../types';

export default function Passeios() {
  const banco = useBanco();
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');

  const termo = busca.trim().toLowerCase();
  const passeios = banco.servicos
    .filter((s) => s.tipo === 'passeio' && s.ativo)
    .filter(
      (s) =>
        !termo ||
        s.nome.toLowerCase().includes(termo) ||
        s.descricao.toLowerCase().includes(termo) ||
        (s.local ?? '').toLowerCase().includes(termo),
    );

  return (
    <>
      <Titulo>Passeios da região</Titulo>
      <p className="-mt-3 mb-5 text-sm text-slate-500">
        Reserva e pagamento são feitos direto com o parceiro. O clube só apresenta e garante o seu
        desconto.
      </p>
      <input
        className={`${inputCls} mb-5 max-w-xs`}
        placeholder="Buscar passeio, local..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {passeios.length === 0 ? (
        <Vazio>Nenhum passeio cadastrado ainda.</Vazio>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {passeios.map((s) => {
            const empresa = empresaPorId(banco, s.empresaId);
            const desc = descontoDoNivel(s, usuario?.nivel);
            return (
              <Card key={s.id}>
                <div className="font-semibold text-slate-900">{s.nome}</div>
                {empresa && (
                  <Link
                    to={`/parceiros/${empresa.id}`}
                    className="text-sm font-medium text-emerald-700 hover:underline"
                  >
                    {empresa.nome}
                  </Link>
                )}
                <p className="mt-2 text-sm text-slate-600">{s.descricao}</p>
                <div className="mt-2 text-sm text-slate-500">
                  {[s.local, s.duracao].filter(Boolean).join(' · ')}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-400 line-through">{brl(s.preco)}</div>
                    <div className="text-xl font-semibold text-emerald-700">
                      {brl(precoComDesconto(s, usuario?.nivel))}
                    </div>
                    <div className="text-xs text-slate-500">{s.unidade}</div>
                  </div>
                  {desc > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      -{desc}%
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
