import { useState } from 'react';
import toast from 'react-hot-toast';
import { inserir, novoId } from '../data/store';
import { useAuth } from '../lib/auth';
import { Campo, Card, Titulo, botaoCls, inputCls } from '../components/ui';
import type { Indicacao } from '../types';

export default function Indicar() {
  const { usuario } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacao, setObservacao] = useState('');
  if (!usuario) return null;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    const nova: Indicacao = {
      id: novoId('i'),
      membroId: usuario.id,
      membroNome: usuario.nome,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      telefone: telefone.trim() || undefined,
      observacao: observacao.trim() || undefined,
      status: 'pendente',
      criadoEm: new Date().toISOString(),
    };
    inserir('indicacoes', nova);
    setNome('');
    setEmail('');
    setTelefone('');
    setObservacao('');
    toast.success('Indicação enviada para aprovação.');
  }

  return (
    <>
      <Titulo>Indicar alguém</Titulo>
      <p className="-mt-3 mb-5 max-w-2xl text-sm text-slate-500">
        A indicação vai para aprovação. Aprovada, a pessoa ganha um acesso de cliente com desconto
        nos parceiros do programa.
      </p>
      <Card className="max-w-lg">
        <form onSubmit={enviar} className="space-y-4">
          <Campo label="Nome">
            <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} required />
          </Campo>
          <Campo label="E-mail">
            <input
              className={inputCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Campo>
          <Campo label="Telefone (opcional)">
            <input className={inputCls} value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </Campo>
          <Campo label="Observação (opcional)">
            <textarea
              className={inputCls}
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Como você conhece a pessoa, o que ela procura..."
            />
          </Campo>
          <button className={botaoCls} type="submit">
            Enviar indicação
          </button>
        </form>
      </Card>
    </>
  );
}
