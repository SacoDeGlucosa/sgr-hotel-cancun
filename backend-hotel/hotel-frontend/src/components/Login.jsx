import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LayoutPage from './LayoutPage';
import { toast } from 'react-toastify';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        toast.success(`¡Bienvenido de vuelta!`);
  
        // Redirigir según el rol
        if (data.usuario.rol === 'administrador') {
          window.location.href = '/admin';
        } else if (data.usuario.rol === 'recepcionista') {
          window.location.href = '/recepcionista';
      } else {
        window.location.href = '/';
      } 
    }   else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor");
    }
  };

  return (
    <LayoutPage backgroundImage="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1920&q=80" blur={true}>
      <div style={cardStyle}>
        {/* Encabezado superior tipo link */}
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>¿No tienes cuenta? </span>
          <Link to="/registro" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Registrate</Link>
        </div>

        <h2 style={titleStyle}>Iniciar sesión</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Correo electrónico</label>
            <input type="email" onChange={(e) => setCorreo(e.target.value)} style={inputStyle} required />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <input type="password" onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          </div>

          <button type="submit" style={btnPrimary}>Entrar</button>
        </form>

        <div style={separator}>o inicia sesión con:</div>

        {/* Botones Sociales Visuales */}
        <div style={socialContainer}>
          <button style={socialBtn}>G</button>
          <button style={socialBtn}>f</button>
          <button style={socialBtn}>A</button>
          <button style={socialBtn}>in</button>
        </div>
      </div>
    </LayoutPage>
  );
};

// Estilos compartidos (puedes usarlos en Registro también)
const cardStyle = { 
  maxWidth: '450px', margin: '40px auto', background: 'white', padding: '40px', 
  borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'sans-serif'
};
const titleStyle = { fontSize: '2rem', fontWeight: '500', marginBottom: '30px', color: '#1a1a1a' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.9rem', fontWeight: 'bold', color: '#333' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '1rem', outline: 'none' };
const btnPrimary = { 
  padding: '14px', backgroundColor: '#80c4ff', color: 'white', border: 'none', 
  borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' 
};
const separator = { textAlign: 'center', margin: '30px 0', color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #eee', lineHeight: '0.1em' };
const socialContainer = { display: 'flex', justifyContent: 'center', gap: '15px' };
const socialBtn = { 
  width: '50px', height: '50px', borderRadius: '8px', border: '1px solid #eee', 
  backgroundColor: 'white', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', color: '#555' 
};

export default Login;