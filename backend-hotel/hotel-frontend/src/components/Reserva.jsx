import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LayoutPage from './LayoutPage';
import { toast } from 'react-toastify';
import { apiFetch, getUsuarioActual } from '../utils/api';

const Reserva = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recibimos la habitación seleccionada desde la página anterior
  const habitacion = location.state?.habitacion;
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);

  useEffect(() => {
  // Traer las reservas de esta habitación para bloquear fechas (mejor esfuerzo).
  // Si el usuario no tiene permisos para ver todas las reservas (ej: huésped),
  // simplemente no bloqueamos fechas en la UI; el backend igual valida al crear.
    apiFetch('/reservas/todas')
      .then(res => res.ok ? res.json() : [])
      .then(reservas => {
        if (!Array.isArray(reservas)) return;
        const ocupadas = reservas
          .filter(r =>
            r.id_habitacion === habitacion.id_habitacion &&
            (r.estado === 'confirmada' || r.estado === 'ocupada')
          )
          .map(r => ({
            inicio: r.fecha_inicio.split('T')[0],
            fin: r.fecha_fin.split('T')[0]
          }));
        setFechasOcupadas(ocupadas);
      });
  }, []);

const fechaEstaOcupada = (fecha) => {
  return fechasOcupadas.some(r => fecha >= r.inicio && fecha <= r.fin);
};
  // Si no hay habitación seleccionada, regresar a habitaciones
  if (!habitacion) {
    navigate('/habitaciones');
    return null;
  }

  // Calcular número de noches y costo total
  const calcularNoches = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin - inicio;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const noches = calcularNoches();
  const costoTotal = noches * habitacion.precio;

  const handleReservar = async () => {
    // Validaciones
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor selecciona las fechas');
      return;
    }
    if (noches <= 0) {
      toast.error('La fecha de salida debe ser posterior a la de entrada');
      return;
    }

    // Verificar que el usuario esté logueado
    const usuario = getUsuarioActual();
    if (!usuario) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/reservas', {
        method: 'POST',
        body: JSON.stringify({
          id_usuario: usuario.id,
          id_habitacion: habitacion.id_habitacion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Reserva creada exitosamente!');
        navigate('/mis-reservas');
      } else {
        toast.error(data.error || 'Error al crear la reserva');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutPage backgroundImage="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1920&q=80" blur={true}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Confirmar Reserva</h2>

        {/* Resumen de la habitación */}
        <div style={habitacionCard}>
          <span style={categoryStyle}>{habitacion.tipo}</span>
          <h3 style={{ margin: '5px 0' }}>Habitación #{habitacion.id_habitacion}</h3>
          <p style={{ color: '#666', margin: 0 }}>{habitacion.descripcion}</p>
          <p style={precioStyle}>${habitacion.precio.toLocaleString()} / noche</p>
        </div>

        {/* Selector de fechas */}
        <div style={fechasContainer}>
          <div style={inputGroup}>
            <label style={labelStyle}>📅 Fecha de entrada</label>
            <input 
              type="date" 
              value={fechaInicio}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                if (fechaEstaOcupada(e.target.value)) {
                  toast.error('Esta fecha no está disponible para esta habitación');
                  return;
                }
                setFechaInicio(e.target.value);
              }}
              style={inputStyle}
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>📅 Fecha de salida</label>
            <input 
              type="date"
              value={fechaFin}
              min={fechaInicio || new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                if (fechaEstaOcupada(e.target.value)) {
                  toast.error('Esta fecha no está disponible para esta habitación');
                  return;
                }
                setFechaFin(e.target.value);
              }}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Resumen de costos */}
        {noches > 0 && (
          <div style={resumenStyle}>
            <div style={resumenRow}>
              <span>{noches} noche(s) x ${habitacion.precio.toLocaleString()}</span>
              <span>${costoTotal.toLocaleString()}</span>
            </div>
            <div style={{...resumenRow, fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px solid #eee', paddingTop: '10px'}}>
              <span>Total</span>
              <span>${costoTotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => navigate('/habitaciones')} style={btnSecundario}>
            ← Volver
          </button>
          <button onClick={handleReservar} style={btnPrimario} disabled={loading}>
            {loading ? 'Procesando...' : '✅ Confirmar Reserva'}
          </button>
        </div>
      </div>
    </LayoutPage>
  );
};

// Estilos
const cardStyle = { maxWidth: '550px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' };
const titleStyle = { fontSize: '1.8rem', fontWeight: '600', marginBottom: '25px', color: '#1a1a1a' };
const habitacionCard = { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #eee' };
const categoryStyle = { fontSize: '0.7rem', color: '#aa8453', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' };
const precioStyle = { color: '#aa8453', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px', marginBottom: 0 };
const fechasContainer = { display: 'flex', gap: '15px', marginBottom: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 };
const labelStyle = { fontSize: '0.85rem', fontWeight: 'bold', color: '#444' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '1rem' };
const resumenStyle = { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '10px' };
const resumenRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' };
const btnPrimario = { flex: 1, padding: '14px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' };
const btnSecundario = { padding: '14px 20px', backgroundColor: 'white', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default Reserva;