import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutPage from './LayoutPage';
import { apiFetch, getUsuarioActual } from '../utils/api';

const PanelAdmin = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar que el usuario sea administrador
    const usuario = getUsuarioActual();
    if (!usuario || usuario.rol !== 'administrador') {
      navigate('/');
      return;
    }

    // Cargar estadísticas y reservas en paralelo
    Promise.all([
      apiFetch('/reservas/estadisticas').then(res => res.json()),
      apiFetch('/reservas/todas').then(res => res.json())
    ])
      .then(([statsData, reservasData]) => {
        setEstadisticas(statsData);
        setReservas(Array.isArray(reservasData) ? reservasData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando datos del panel:', err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <LayoutPage>
      <div style={containerStyle}>
        <h2 style={titleStyle}>Panel de Administrador</h2>

        {/* Tarjetas de estadísticas */}
        {estadisticas && estadisticas.habitaciones && (
          <div style={statsGrid}>
            <div style={{...statCard, borderLeft: '4px solid #2ecc71'}}>
              <h3 style={statNumber}>{estadisticas.habitaciones.total_habitaciones}</h3>
              <p style={statLabel}>Total Habitaciones</p>
            </div>
            <div style={{...statCard, borderLeft: '4px solid #3498db'}}>
              <h3 style={statNumber}>{estadisticas.habitaciones.libres}</h3>
              <p style={statLabel}>Habitaciones Libres</p>
            </div>
            <div style={{...statCard, borderLeft: '4px solid #e74c3c'}}>
              <h3 style={statNumber}>{estadisticas.habitaciones.reservadas}</h3>
              <p style={statLabel}>Habitaciones Reservadas</p>
            </div>
            <div style={{...statCard, borderLeft: '4px solid #f39c12'}}>
              <h3 style={statNumber}>{estadisticas.reservas.total_reservas}</h3>
              <p style={statLabel}>Total Reservas</p>
            </div>
            <div style={{...statCard, borderLeft: '4px solid #9b59b6'}}>
              <h3 style={statNumber}>{estadisticas.reservas.reservas_activas}</h3>
              <p style={statLabel}>Reservas Activas</p>
            </div>
            <div style={{...statCard, borderLeft: '4px solid #95a5a6'}}>
              <h3 style={statNumber}>{estadisticas.reservas.reservas_canceladas}</h3>
              <p style={statLabel}>Reservas Canceladas</p>
            </div>
          </div>
        )}

        {/* Tabla de reservas */}
        <h3 style={subtitleStyle}>Todas las Reservas</h3>
        {loading ? (
          <p>Cargando reservas...</p>
        ) : reservas.length === 0 ? (
          <p style={{ color: '#666' }}>No hay reservas registradas.</p>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Huésped</th>
                  <th style={thStyle}>Habitación</th>
                  <th style={thStyle}>Entrada</th>
                  <th style={thStyle}>Salida</th>
                  <th style={thStyle}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id_reserva} style={trStyle}>
                    <td style={tdStyle}>{r.id_reserva}</td>
                    <td style={tdStyle}>{r.nombre} {r.apellido}</td>
                    <td style={tdStyle}>#{r.id_habitacion} - {r.tipo}</td>
                    <td style={tdStyle}>{new Date(r.fecha_inicio).toLocaleDateString()}</td>
                    <td style={tdStyle}>{new Date(r.fecha_fin).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <span style={{
                        ...estadoTag,
                        backgroundColor: r.estado === 'confirmada' ? '#2ecc71' : '#e74c3c'
                      }}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutPage>
  );
};

// Estilos
const containerStyle = { padding: '120px 5% 60px', minHeight: '100vh', backgroundColor: '#fdfdfd' };
const titleStyle = { fontSize: '2rem', fontWeight: '600', marginBottom: '30px', color: '#1a1a1a' };
const subtitleStyle = { fontSize: '1.4rem', fontWeight: '600', margin: '30px 0 15px', color: '#1a1a1a' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' };
const statCard = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' };
const statNumber = { fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1a1a1a' };
const statLabel = { color: '#666', fontSize: '0.85rem', margin: 0 };
const tableWrapper = { overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadStyle = { backgroundColor: '#f8f9fa' };
const thStyle = { padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#444', fontSize: '0.85rem', borderBottom: '2px solid #eee' };
const trStyle = { borderBottom: '1px solid #f0f0f0' };
const tdStyle = { padding: '15px', color: '#555', fontSize: '0.9rem' };
const estadoTag = { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' };

export default PanelAdmin;
