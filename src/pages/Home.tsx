import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useBanco } from '../data/store';
import { Card, Estrelas, NivelBadge, Titulo, Vazio } from '../components/ui';
import { avaliacoesDaEmpresa, mediaNotas } from '../lib/util';
import { NIVEIS } from '../types';

function Numero({ label, valor }: { label: string; valor: string | number }) {
  return (
    <Card>
      <div className="text-3xl font-semibold text-slate-900">{valor}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </Card>
  );
}

export default function Home() {
  const { usuario } = useAuth();
  const banco = useBanco();
  if (!usuario) return null;

  const ranking = banco.empresas
    .filter((e) => e.ativo)
    .map((e) => ({ empresa: e, nota: mediaNotas(avaliacoesDaEmpresa(banco, e.id)) }))
    .sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0))
    .slice(0, 4);

  if (usuario.papel === 'admin') {
    return (
      <>
        <Titulo>Visão geral</Titulo>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Numero label="Membros" valor={banco.usuarios.filter((u) => u.papel === 'membro').length} />
          <Numero label="Clientes" valor={banco.usuarios.filter((u) => u.papel === 'cliente').length} />
          <Numero label="Parceiros" valor={banco.empresas.length} />
          <Numero
            label="Indicações pendentes"
            valor={banco.indicacoes.filter((i) => i.status === 'pendente').length}
          />
        </div>
        <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Parceiros melhor avaliados</h2>
        <ListaRanking ranking={ranking} />
      </>
    );
  }

  if (usuario.papel === 'empresa') {
    const empresa = banco.empresas.find((e) => e.id === usuario.empresaId);
    const avaliacoes = empresa ? avaliacoesDaEmpresa(banco, empresa.id) : [];
    const servicos = banco.servicos.filter((s) => s.empresaId === usuario.empresaId);
    return (
      <>
        <Titulo>{empresa?.nome ?? 'Minha empresa'}</Titulo>
        <div className="grid gap-4 sm:grid-cols-3">
          <Numero label="Serviços publicados" valor={servicos.filter((s) => s.ativo).length} />
          <Numero label="Avaliações" valor={avaliacoes.length} />
          <Card>
            <div className="text-3xl font-semibold text-slate-900">
              <Estrelas nota={mediaNotas(avaliacoes)} tamanho="text-2xl" />
            </div>
            <div className="mt-1 text-sm text-slate-500">Nota média</div>
          </Card>
        </div>
        <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Últimas avaliações</h2>
        {avaliacoes.length === 0 ? (
          <Vazio>Ainda sem avaliações.</Vazio>
        ) : (
          <div className="space-y-3">
            {avaliacoes.slice(0, 5).map((a) => (
              <Card key={a.id}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{a.autorNome}</span>
                  <Estrelas nota={a.nota} tamanho="text-sm" />
                </div>
                <p className="mt-1 text-sm text-slate-600">{a.comentario}</p>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-6 text-sm text-slate-500">
          Cadastre e edite seus serviços em{' '}
          <Link className="font-medium text-emerald-700" to="/minha-empresa">
            Minha empresa
          </Link>
          .
        </p>
      </>
    );
  }

  // membro e cliente
  const nivel = usuario.nivel ?? 'cliente';
  const info = NIVEIS[nivel];
  const minhasIndicacoes = banco.indicacoes.filter((i) => i.membroId === usuario.id);
  const quemIndicou = banco.usuarios.find((u) => u.id === usuario.indicadoPor);

  return (
    <>
      <Titulo>Olá, {usuario.nome.split(' ')[0]}</Titulo>
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-slate-500">Seu acesso</span>
              <NivelBadge nivel={nivel} />
            </div>
            <p className="text-sm text-slate-600">{info.descricao}</p>
            {quemIndicou && (
              <p className="mt-1 text-sm text-slate-500">Indicado por {quemIndicou.nome}.</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-semibold text-emerald-700">{info.descontoPadrao}%</div>
            <div className="text-sm text-slate-500">desconto padrão nos parceiros</div>
          </div>
        </div>
      </Card>

      {usuario.papel === 'membro' && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Numero label="Indicações feitas" valor={minhasIndicacoes.length} />
          <Numero
            label="Aprovadas"
            valor={minhasIndicacoes.filter((i) => i.status === 'aprovada').length}
          />
          <Numero
            label="Pendentes"
            valor={minhasIndicacoes.filter((i) => i.status === 'pendente').length}
          />
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-slate-800">Parceiros melhor avaliados</h2>
      <ListaRanking ranking={ranking} />
    </>
  );
}

function ListaRanking({
  ranking,
}: {
  ranking: { empresa: { id: string; nome: string; cidade: string }; nota: number | null }[];
}) {
  if (!ranking.length) return <Vazio>Nenhum parceiro cadastrado ainda.</Vazio>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ranking.map(({ empresa, nota }) => (
        <Link key={empresa.id} to={`/parceiros/${empresa.id}`}>
          <Card className="hover:border-emerald-300">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{empresa.nome}</div>
                <div className="text-sm text-slate-500">{empresa.cidade}</div>
              </div>
              <Estrelas nota={nota} tamanho="text-sm" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
