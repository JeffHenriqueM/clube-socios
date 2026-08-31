import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { NivelBadge } from './ui';
import type { Papel } from '../types';

interface ItemNav {
  para: string;
  label: string;
  papeis: Papel[];
}

const NAV: ItemNav[] = [
  { para: '/', label: 'Início', papeis: ['admin', 'socio', 'cliente', 'empresa'] },
  { para: '/parceiros', label: 'Parceiros', papeis: ['admin', 'socio', 'cliente'] },
  { para: '/passeios', label: 'Passeios', papeis: ['admin', 'socio', 'cliente'] },
  { para: '/indicar', label: 'Indicar', papeis: ['socio'] },
  { para: '/indicacoes', label: 'Indicações', papeis: ['admin', 'socio'] },
  { para: '/minha-empresa', label: 'Minha empresa', papeis: ['empresa'] },
  { para: '/admin/empresas', label: 'Empresas', papeis: ['admin'] },
  { para: '/admin/pessoas', label: 'Pessoas', papeis: ['admin'] },
];

export default function Layout() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  if (!usuario) return null;

  const itens = NAV.filter((i) => i.papeis.includes(usuario.papel));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="text-lg font-bold text-emerald-700">Clube de Sócios</span>
          <nav className="flex flex-1 flex-wrap gap-1">
            {itens.map((i) => (
              <NavLink
                key={i.para}
                to={i.para}
                end={i.para === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {i.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-800">{usuario.nome}</div>
              <div className="text-xs text-slate-500">
                {usuario.papel === 'empresa' ? 'Parceiro' : usuario.papel}
              </div>
            </div>
            <NivelBadge nivel={usuario.nivel} />
            <button
              type="button"
              onClick={() => {
                sair();
                navigate('/login');
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
