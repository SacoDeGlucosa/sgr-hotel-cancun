import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar'; 
import Inicio from './components/Inicio';
import Registro from './components/Registro';
import Login from './components/Login';
import Habitaciones from './components/Habitaciones';
import Reserva from './components/Reserva'; // ← NUEVO
import MisReservas from './components/MisReservas'; // ← NUEVO
import Calendario from './components/Calendario'; // ← NUEVO
import PanelAdmin from './components/PanelAdmin'; // ← NUEVO
import PanelRecepcionista from './components/PanelRecepcionista'; // ← NUEVO

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("usuario");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  return (
    <Router>
      {/* Configuramos los avisos: Arriba a la derecha, 5 segundos (5000ms), 
          tema claro (blanco) y con su barra de progreso. 
      */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" 
      />

      {/* --- AQUÍ ESTÁ LA MAGIA QUE FALTABA --- */}
      {/* Esto devuelve a la vida tu logo y tus botones */}
      <Navbar user={user} />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/habitaciones" element={<Habitaciones />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reserva" element={<Reserva />} /> {/* ← NUEVO */}
        <Route path="/mis-reservas" element={<MisReservas />} /> {/* ← NUEVO */}
        <Route path="/calendario" element={<Calendario />} /> {/* ← NUEVO */}
        <Route path="/admin" element={<PanelAdmin />} /> {/* ← NUEVO */}
        <Route path="/recepcionista" element={<PanelRecepcionista />} /> {/* ← NUEVO */}
      </Routes>
    </Router>
  );
}

export default App;