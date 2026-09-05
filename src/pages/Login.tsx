import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import { resetarBanco } from '../data/store';
import { Campo, botaoCls, botaoSecCls, inputCls } from '../components/ui';

const DEMOS = [
  { label: 'Admin', email: 'admin@indica.com' },
  { label: 'Membro Ouro', email: 'marina@exemplo.com' },
  { label: 'Membro Bronze', email: 'rafael@exemplo.com' },
  { label: 'Cliente', email: 'camila@exemplo.com' },
  { label: 'Parceiro', email: 'contato@maraberto.com' },
];

export default function Login() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('123456');

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const r = entrar(email, senha);
    if (!r.ok) toast.error(r.erro ?? 'Não foi possível entrar.');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-emerald-700">Programa Indica</h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Benefícios, parceiros e passeios da região.
        </p>
        <form onSubmit={submeter} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Campo label="E-mail">
            <input
              className={inputCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </Campo>
          <Campo label="Senha">
            <input
              className={inputCls}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </Campo>
          <button className={`${botaoCls} w-full`} type="submit">
            Entrar
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Acessos de teste (senha 123456)
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => setEmail(d.email)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                {d.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              resetarBanco();
              toast.success('Dados de exemplo restaurados.');
            }}
            className={`${botaoSecCls} mt-3 w-full text-xs`}
          >
            Restaurar dados de exemplo
          </button>
        </div>
      </div>
    </div>
  );
}
