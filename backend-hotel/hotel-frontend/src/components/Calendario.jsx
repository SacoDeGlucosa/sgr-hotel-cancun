import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import LayoutPage from './LayoutPage';

const Calendario = () => {
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
      toast.error('Debes iniciar sesión para ver el calendario');
      navigate('/login');
      return;
    }
  // ... resto del fetch
}, []);
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    // Si es admin o recepcionista ve todas, si es huésped solo las suyas
    const url = usuario.rol === 'huesped' 
      ? `http://localhost:3000/api/reservas/usuario/${usuario.id}`
      : 'http://localhost:3000/api/reservas/todas';

    fetch(url)
      .then(res => res.json())
      .then(reservas => {
        const eventosReservas = reservas.map(r => ({
          title: `Hab #${r.id_habitacion} - ${r.nombre}`,
          start: r.fecha_inicio.split('T')[0],
          end: r.fecha_fin.split('T')[0],
          color: getColorEstado(r.estado)
        }));
        setEventos(eventosReservas);
      });
  }, []);

  const getColorEstado = (estado) => {
    if (estado === 'confirmada') return '#3498db';  // Azul
    if (estado === 'ocupada') return '#e74c3c';     // Rojo
    if (estado === 'finalizada') return '#95a5a6';  // Gris
    if (estado === 'cancelada') return '#e67e22';   // Naranja
    return '#2ecc71';                               // Verde
  };

  return (
    <LayoutPage>
      <div style={containerStyle}>
        <h2 style={titleStyle}>Calendario de Reservas</h2>

        {/* Leyenda de colores */}
        <div style={leyendaStyle}>
          <span style={{...tagStyle, backgroundColor: '#2ecc71'}}>🟢 Libre</span>
          <span style={{...tagStyle, backgroundColor: '#3498db'}}>🔵 Confirmada</span>
          <span style={{...tagStyle, backgroundColor: '#e74c3c'}}>🔴 Ocupada</span>
          <span style={{...tagStyle, backgroundColor: '#95a5a6'}}>⚪ Finalizada</span>
          <span style={{...tagStyle, backgroundColor: '#e67e22'}}>🟠 Cancelada</span>
        </div>

        {/* Calendario */}
        <div style={calendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            events={eventos}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            height="auto"
          />
        </div>
      </div>
    </LayoutPage>
  );
};

// Estilos
const containerStyle = { padding: '120px 5% 60px', minHeight: '100vh', backgroundColor: '#fdfdfd' };
const titleStyle = { fontSize: '2rem', fontWeight: '600', marginBottom: '20px', color: '#1a1a1a' };
const leyendaStyle = { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' };
const tagStyle = { padding: '6px 15px', borderRadius: '20px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' };
const calendarWrapper = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' };

export default Calendario;