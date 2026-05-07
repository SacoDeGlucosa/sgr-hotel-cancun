import { Link } from 'react-router-dom';
import logoHotel from '../assets/logo.png.png'; 

const Navbar = ({ user }) => { // Quitamos showBanner de los props

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    // Usamos esto para limpiar el estado y redirigir
    window.location.href = "/";
  };

  return (
    <nav style={{
      position: 'absolute',
      top: 0, // Siempre en 0 ahora que no hay banner
      left: 0, 
      width: '100%',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '15px 5%', 
      zIndex: 1000, 
      boxSizing: 'border-box',
      // Gradiente para que el logo y letras blancas se vean bien sobre el fondo
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
    }}>
      
      <Link to="/">
        <img src={logoHotel} alt="Logo" style={{ height: '70px', objectFit: 'contain' }} />
      </Link>
      
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        {/* Este link te llevará a la nueva página de habitaciones que creamos */}
        <Link to="/habitaciones" style={linkStyle}>Habitaciones</Link>
        <Link to="/calendario" style={linkStyle}>Calendario</Link>
        
        {!user ? (
          <>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
            <Link to="/login" style={linkStyle}>Iniciar Sesión</Link>
            <Link to="/registro" style={linkStyle}>Registrarse</Link>
          </>
        ) : (
          <>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>Hola, {user.nombre}</span>

            {/* Link según el rol */}
            {user.rol === 'administrador' && (
              <Link to="/admin" style={linkStyle}>Panel Admin</Link>
            )}
            {user.rol === 'recepcionista' && (
              <Link to="/recepcionista" style={linkStyle}>Panel Recepcionista</Link>
            )}
            {user.rol === 'huesped' && (
              <Link to="/mis-reservas" style={linkStyle}>Mis Reservas</Link>
            )}

            <button onClick={handleLogout} style={logoutBtnStyle}>Cerrar Sesión</button>
          </>
        )}
      </div>
    </nav>
  );
};

// Mantenemos tus estilos originales que se ven muy bien
const linkStyle = { 
  color: 'white', 
  textDecoration: 'none', 
  fontWeight: '400', 
  fontSize: '1rem', 
  textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
  transition: '0.3s opacity'
};

const logoutBtnStyle = { 
  background: 'none', 
  border: 'none', 
  color: '#ff4d4d', 
  cursor: 'pointer', 
  fontWeight: 'bold', 
  fontSize: '0.9rem' 
};

export default Navbar;