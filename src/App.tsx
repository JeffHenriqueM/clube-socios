import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './lib/auth';
import Login from './pages/Login';
import Home from './pages/Home';
import Parceiros from './pages/Parceiros';
import EmpresaDetalhe from './pages/EmpresaDetalhe';
import Passeios from './pages/Passeios';
import Indicar from './pages/Indicar';
import Indicacoes from './pages/Indicacoes';
import MinhaEmpresa from './pages/MinhaEmpresa';
import AdminEmpresas from './pages/AdminEmpresas';
import AdminPessoas from './pages/AdminPessoas';
import type { Papel } from './types';

function Protegido({ papeis, children }: { papeis?: Papel[]; children: JSX.Element }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (papeis && !papeis.includes(usuario.papel)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <Protegido>
            <Layout />
          </Protegido>
        }
      >
        <Route path="/" element={<Home />} />
        <Route
          path="/parceiros"
          element={
            <Protegido papeis={['admin', 'membro', 'cliente']}>
              <Parceiros />
            </Protegido>
          }
        />
        <Route
          path="/parceiros/:id"
          element={
            <Protegido papeis={['admin', 'membro', 'cliente']}>
              <EmpresaDetalhe />
            </Protegido>
          }
        />
        <Route
          path="/passeios"
          element={
            <Protegido papeis={['admin', 'membro', 'cliente']}>
              <Passeios />
            </Protegido>
          }
        />
        <Route
          path="/indicar"
          element={
            <Protegido papeis={['membro']}>
              <Indicar />
            </Protegido>
          }
        />
        <Route
          path="/indicacoes"
          element={
            <Protegido papeis={['admin', 'membro']}>
              <Indicacoes />
            </Protegido>
          }
        />
        <Route
          path="/minha-empresa"
          element={
            <Protegido papeis={['empresa']}>
              <MinhaEmpresa />
            </Protegido>
          }
        />
        <Route
          path="/admin/empresas"
          element={
            <Protegido papeis={['admin']}>
              <AdminEmpresas />
            </Protegido>
          }
        />
        <Route
          path="/admin/pessoas"
          element={
            <Protegido papeis={['admin']}>
              <AdminPessoas />
            </Protegido>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
