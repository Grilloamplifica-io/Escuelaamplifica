import { Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Shell } from './components/Shell';
import { Home } from './pages/Home';
import { Catalogo } from './pages/Catalogo';
import { CursoPage } from './pages/Curso';
import { Reproductor } from './pages/Reproductor';
import { Evaluacion } from './pages/Evaluacion';
import { Certificado } from './pages/Certificado';
import { Perfil } from './pages/Perfil';
import { Equipo } from './pages/Equipo';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/curso/:id" element={<CursoPage />} />
          <Route path="/reproductor/:id" element={<Reproductor />} />
          <Route path="/evaluacion/:id" element={<Evaluacion />} />
          <Route path="/certificado/:id" element={<Certificado />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
