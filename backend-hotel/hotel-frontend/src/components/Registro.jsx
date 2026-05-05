import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LayoutPage from './LayoutPage';
import { toast } from 'react-toastify';

const Registro = () => {
  const [formData, setFormData] = useState({ 
    nombre: '', apellido: '', correo: '', password: '' 
  });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleRegister = async (e) => {
    e.preventDefault(); // IMPRESCINDIBLE: Evita que la página se recargue
    console.log("Intentando registrar a:", formData);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("¡Registro exitoso! Ahora inicia sesión.");
        navigate('/login'); // Te manda al login tras el éxito
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al registrar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("El servidor no responde. ¿Está encendido el backend?");
    }
  };

  return (
    <LayoutPage backgroundImage="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80" blur={true}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>¿Ya tienes cuenta? </span>
          <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Entrar</Link>
        </div>

        <h2 style={titleStyle}>Crear una cuenta</h2>
        
        {/* El onSubmit en el form es lo que hace que el botón funcione */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Correo electrónico</label>
            <input name="correo" type="email" onChange={handleChange} style={inputStyle} required />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
             <div style={{...inputGroup, flex: 1}}>
                <label style={labelStyle}>Nombre</label>
                <input name="nombre" onChange={handleChange} style={inputStyle} required />
             </div>
             <div style={{...inputGroup, flex: 1}}>
                <label style={labelStyle}>Apellido</label>
                <input name="apellido" onChange={handleChange} style={inputStyle} required />
             </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <input name="password" type="password" onChange={handleChange} style={inputStyle} required />
          </div>

          {/* El botón DEBE ser type="submit" */}
          <button type="submit" style={btnPrimary}>Siguiente</button>
        </form>

        <div style={separator}>O regístrate con:</div>
        
        <div style={socialContainer}>
          <button style={socialBtn}>G</button>
          <button style={socialBtn}>f</button>
          <button style={socialBtn}>A</button>
        </div>
      </div>
    </LayoutPage>
  );
};

// Estilos (Cópialos tal cual)
const cardStyle = { maxWidth: '480px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' };
const titleStyle = { fontSize: '2.2rem', fontWeight: '500', marginBottom: '25px', color: '#1a1a1a' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.9rem', fontWeight: 'bold', color: '#333' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '1rem', outline: 'none' };
const btnPrimary = { padding: '14px', backgroundColor: '#80c4ff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' };
const separator = { textAlign: 'center', margin: '25px 0', color: '#666', fontSize: '0.8rem' };
const socialContainer = { display: 'flex', justifyContent: 'center', gap: '15px' };
const socialBtn = { width: '50px', height: '50px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold' };

export default Registro;