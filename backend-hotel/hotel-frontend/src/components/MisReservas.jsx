import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LayoutPage from './LayoutPage';
import { apiFetch, getUsuarioActual } from '../utils/api';

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = getUsuarioActual();

    if (!usuario) {
      navigate('/login');
      return;
    }

    apiFetch(`/reservas/usuario/${usuario.id}`)
      .then(res => res.json())
      .then(data => {
        setReservas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);
const handleCancelar = async (id_reserva) => {
  if (!window.confirm('¿Estás seguro que deseas cancelar esta reserva?')) return;

  try {
    const response = await apiFetch(`/reservas/${id_reserva}/cancelar`, {
      method: 'PUT'
    });
    const data = await response.json();
    if (response.ok) {
      toast.success('Reserva cancelada exitosamente');
      // Recargar las reservas
      setReservas(reservas.map(r => 
        r.id_reserva === id_reserva ? {...r, estado: 'cancelada'} : r
      ));
    } else {
      toast.error(data.error);
    }
  } catch (error) {
    toast.error('Error al conectar con el servidor');
  }
};

  const getEstadoColor = (estado) => {
    if (estado === 'confirmada') return '#2ecc71';
    if (estado === 'cancelada') return '#e74c3c';
    return '#f39c12';
  };

  return (
    <LayoutPage>
      <div style={containerStyle}>
        <h2 style={titleStyle}>Mis Reservas</h2>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando reservas...</p>
        ) : reservas.length === 0 ? (
          <div style={emptyStyle}>
            <p>No tienes reservas todavía.</p>
            <button onClick={() => navigate('/habitaciones')} style={btnStyle}>
              Ver habitaciones
            </button>
          </div>
        ) : (
          <div style={gridStyle}>
            {reservas.map((r) => (
              <div key={r.id_reserva} style={cardStyle}>
                <div style={cardHeader}>
                  <span style={categoryStyle}>{r.tipo}</span>
                  <span style={{...estadoStyle, backgroundColor: getEstadoColor(r.estado)}}>
                    {r.estado}
                  </span>
                </div>
                <h3 style={{ margin: '8px 0' }}>Habitación #{r.id_habitacion}</h3>
                <div style={infoStyle}>
                  <p>📅 <strong>Entrada:</strong> {new Date(r.fecha_inicio).toLocaleDateString()}</p>
                  <p>📅 <strong>Salida:</strong> {new Date(r.fecha_fin).toLocaleDateString()}</p>
                  <p>💰 <strong>Precio/noche:</strong> ${r.precio.toLocaleString()}</p>
                  <p>💵 <strong>Total estimado:</strong> ${(r.precio * Math.ceil((new Date(r.fecha_fin) - new Date(r.fecha_inicio)) / (1000 * 60 * 60 * 24))).toLocaleString()}</p>
                </div>
              
                {/* Botón cancelar solo si está confirmada */}
                {r.estado === 'confirmada' && (
                  <button 
                    onClick={() => handleCancelar(r.id_reserva)}
                    style={btnCancelar}
                  >
                    ❌ Cancelar reserva
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutPage>
  );
};

// Estilos
const containerStyle = { padding: '120px 5% 60px', minHeight: '100vh', backgroundColor: '#fdfdfd' };
const titleStyle = { fontSize: '2rem', fontWeight: '600', marginBottom: '30px', color: '#1a1a1a' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #eee' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const categoryStyle = { fontSize: '0.7rem', color: '#aa8453', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' };
const estadoStyle = { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' };
const infoStyle = { color: '#555', fontSize: '0.9rem', lineHeight: '1.8' };
const emptyStyle = { textAlign: 'center', padding: '60px', color: '#666' };
const btnStyle = { marginTop: '15px', padding: '12px 25px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancelar = { 
  marginTop: '10px', padding: '8px 16px', backgroundColor: '#e74c3c', 
  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', 
  fontWeight: 'bold', fontSize: '0.85rem', width: '100%' 
};

export default MisReservas;