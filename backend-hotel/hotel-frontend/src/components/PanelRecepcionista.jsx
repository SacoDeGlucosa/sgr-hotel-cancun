import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutPage from './LayoutPage';
import { toast } from 'react-toastify';
import { apiFetch, getUsuarioActual } from '../utils/api';

const PanelRecepcionista = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = getUsuarioActual();
    if (!usuario || usuario.rol !== 'recepcionista') {
      navigate('/');
      return;
    }
    cargarReservas();
  }, []);

  const cargarReservas = () => {
    apiFetch('/reservas/todas')
      .then(res => res.json())
      .then(data => {
        setReservas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando reservas:', err);
        setLoading(false);
      });
  };

  const handleCheckIn = async (id_reserva) => {
    try {
      const response = await apiFetch(`/reservas/${id_reserva}/checkin`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('✅ Check-in realizado exitosamente');
        cargarReservas();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleCheckOut = async (id_reserva) => {
    try {
      const response = await apiFetch(`/reservas/${id_reserva}/checkout`, {
        method: 'PUT',
        body: JSON.stringify({ cargos_adicionales: 0 })
      });
      const data = await response.json();
      if (response.ok) {
        const f = data.factura;
        toast.success(
          `✅ Check-out completado. Total facturado: $${Number(f.total_pagado).toLocaleString()} (${f.noches} noche(s) × $${Number(f.precio_por_noche).toLocaleString()})`,
          { autoClose: 6000 }
        );
        cargarReservas();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor');
    }
  };

  const getEstadoColor = (estado) => {
    if (estado === 'confirmada') return '#3498db';
    if (estado === 'ocupada') return '#e74c3c';
    if (estado === 'finalizada') return '#95a5a6';
    if (estado === 'cancelada') return '#e67e22';
    return '#95a5a6';
  };

  return (
    <LayoutPage>
      <div style={containerStyle}>
        <h2 style={titleStyle}>Panel de Recepcionista</h2>
        <p style={subtitleStyle}>Gestiona los check-in y check-out de los huéspedes</p>

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
                  <th style={thStyle}>Acciones</th>
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
                        backgroundColor: getEstadoColor(r.estado)
                      }}>
                        {r.estado}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {r.estado === 'confirmada' && (
                        <button 
                          onClick={() => handleCheckIn(r.id_reserva)}
                          style={btnCheckin}
                        >
                          Check-in
                        </button>
                      )}
                      {r.estado === 'ocupada' && (
                        <button 
                          onClick={() => handleCheckOut(r.id_reserva)}
                          style={btnCheckout}
                        >
                          Check-out
                        </button>
                      )}
                      {(r.estado === 'finalizada' || r.estado === 'cancelada') && (
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Sin acciones</span>
                      )}
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
const titleStyle = { fontSize: '2rem', fontWeight: '600', marginBottom: '5px', color: '#1a1a1a' };
const subtitleStyle = { color: '#666', marginBottom: '30px' };
const tableWrapper = { overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadStyle = { backgroundColor: '#f8f9fa' };
const thStyle = { padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#444', fontSize: '0.85rem', borderBottom: '2px solid #eee' };
const trStyle = { borderBottom: '1px solid #f0f0f0' };
const tdStyle = { padding: '15px', color: '#555', fontSize: '0.9rem' };
const estadoTag = { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' };
const btnCheckin = { padding: '6px 14px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };
const btnCheckout = { padding: '6px 14px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };

export default PanelRecepcionista;