import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // <-- NUEVO: Para leer la URL
import LayoutPage from "./LayoutPage";

function Habitaciones() {
  const [searchParams] = useSearchParams(); // <-- NUEVO: Captura los parámetros
  const [habitaciones, setHabitaciones] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const navigate = useNavigate();
  const [filtroPrecio, setFiltroPrecio] = useState(300000);

  // --- LECTURA DE CAPACIDAD DESDE LA URL ---
  const adultosReq = parseInt(searchParams.get("adultos") || "1");
  const niñosReq = parseInt(searchParams.get("niños") || "0");
  const totalPersonas = adultosReq + niñosReq;

  useEffect(() => {
    fetch("http://localhost:3000/api/habitaciones")
      .then(res => res.json())
      .then(data => setHabitaciones(data))
      .catch(err => console.log("Error:", err));
  }, []);

  const getImagenPorTipo = (tipo) => {
    const t = tipo.toLowerCase();
    if (t === 'suite') return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600";
    if (t === 'familiar') return "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600";
    return "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=600";
  };

  // --- LÓGICA DE DETALLES Y CAMAS ---
  const getDetalles = (tipo) => {
    const t = tipo.toLowerCase();
    if (t === 'estandar') {
      return {
        desc: "Una habitación simple, bonita y elegante. Ideal para estancias cortas o negocios.",
        camas: "1 Cama King o 2 Camas Twin"
      };
    }
    if (t === 'suite') {
      return {
        desc: "Experiencia de lujo superior con espacios integrados y acabados en mármol.",
        camas: "1 Cama King + 1 Sofá Cama Junior"
      };
    }
    return {
      desc: "Espacio amplio diseñado para la unión familiar. Habitaciones conectadas.",
      camas: "2 Camas King + 2 Camas Junior"
    };
  };

  // --- LÓGICA DE AMENIDADES POR TIPO ---
  const renderAmenidades = (tipo) => {
    const t = tipo.toLowerCase();
    
    if (t === 'estandar') {
      return (
        <div style={amenitiesGrid}>
          <span style={amenityTag}>🌐 Wi-Fi</span>
          <span style={amenityTag}>📺 TV Cable</span>
        </div>
      );
    } 
    
    if (t === 'suite') {
      return (
        <div style={amenitiesGrid}>
          <span style={amenityTag}>🌐 Wi-Fi 5G</span>
          <span style={amenityTag}>🍸 MiniBar Premium</span>
          <span style={amenityTag}>🛁 Baño de Lujo</span>
          <span style={amenityTag}>🎬 Smart TV (Apps)</span>
          <span style={amenityTag}>🥤 Bebidas Gratis</span>
        </div>
      );
    }

    if (t === 'familiar') {
      return (
        <div style={amenitiesGrid}>
          <span style={amenityTag}>🌐 Wi-Fi</span>
          <span style={amenityTag}>🎬 Smart TV (Apps)</span>
          <span style={amenityTag}>🥤 MiniBar</span>
        </div>
      );
    }
  };

  // --- FILTRADO MAESTRO (Tipo + Precio + Capacidad) ---
  const habitacionesFiltradas = habitaciones.filter(h => {
    const tipoStr = h.tipo.toLowerCase();
    
    // 1. Filtros manuales del usuario (Select y Rango)
    const coincideTipo = filtroTipo === "todos" || tipoStr === filtroTipo.toLowerCase();
    const coincidePrecio = h.precio <= filtroPrecio;
    
    // 2. Filtro automático de capacidad (Oculto)
    let coincideCapacidad = false;
    if (tipoStr === 'estandar') {
      coincideCapacidad = adultosReq <= 2 && niñosReq <= 1 && totalPersonas <= 3;
    } else if (tipoStr === 'suite') {
      coincideCapacidad = totalPersonas >= 2 && totalPersonas <= 6;
    } else if (tipoStr === 'familiar') {
      coincideCapacidad = totalPersonas >= 4 && totalPersonas <= 8;
    }

    // Deben cumplirse todas las condiciones para mostrar la habitación
    return coincideTipo && coincidePrecio && coincideCapacidad;
  });

  return (
    <LayoutPage>
      <div style={containerStyle}>
        
        {/* INDICADOR DE BÚSQUEDA (Solo se muestra si vienen parámetros de la URL) */}
        {searchParams.has("adultos") && (
          <div style={infoBannerStyle}>
            🏨 Mostrando opciones ideales para <strong>{totalPersonas} personas</strong> ({adultosReq} adultos y {niñosReq} niños).
          </div>
        )}

        {/* FILTROS MANUALES */}
        <div style={filterSectionStyle}>
          <div style={filterGroup}>
            <label style={labelStyle}>Categoría</label>
            <select style={selectStyle} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="todos">Todos los estilos</option>
              <option value="estandar">Estándar</option>
              <option value="suite">Suite de Lujo</option>
              <option value="familiar">Familiar</option>
            </select>
          </div>

          <div style={filterGroup}>
            <label style={labelStyle}>Precio máx: <strong>${filtroPrecio.toLocaleString()}</strong></label>
            <input 
              type="range" min="100000" max="300000" step="10000"
              value={filtroPrecio}
              onChange={(e) => setFiltroPrecio(e.target.value)}
              style={rangeStyle}
            />
          </div>
        </div>

        {/* GRID DE CARDS */}
        <div style={gridStyle}>
          {habitacionesFiltradas.length > 0 ? (
            habitacionesFiltradas.map((h) => {
              const detalles = getDetalles(h.tipo); // Extraemos descripciones y camas
              return (
                <div key={h.id_habitacion} style={cardStyle}>
                  <div style={imageWrapper}>
                    <img src={getImagenPorTipo(h.tipo)} alt={h.tipo} style={imgStyle} />
                    <div style={priceTag}>${h.precio.toLocaleString()}</div>
                  </div>
                  
                  <div style={contentStyle}>
                    <span style={categoryStyle}>{h.tipo}</span>
                    <h3 style={nameStyle}>Habitación #{h.id_habitacion}</h3>
                    
                    {/* Descripciones y camas inyectadas */}
                    <p style={descText}>{detalles.desc}</p>
                    <p style={camasText}>🛏️ <strong>Camas:</strong> {detalles.camas}</p>

                    {/* Amenidades */}
                    {renderAmenidades(h.tipo)}
                    
                    <button 
                      style={btnStyle}
                      onClick={() => navigate('/reserva', { state: { habitacion: h } })}
                    >
                      Reservar ahora
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
             <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
              No hay habitaciones disponibles para la cantidad de personas o filtros seleccionados.
             </p>
          )}
        </div>
      </div>
    </LayoutPage>
  );
}

// --- NUEVOS ESTILOS ---
const infoBannerStyle = {
  backgroundColor: '#eef5ea', color: '#2b5a2e', padding: '15px 20px', borderRadius: '8px', 
  marginBottom: '20px', textAlign: 'center', fontWeight: '500', border: '1px solid #c9e0cb'
};
const descText = { fontSize: '0.85rem', color: '#666', lineHeight: '1.4', marginBottom: '8px', fontStyle: 'italic' };
const camasText = { fontSize: '0.85rem', color: '#333', marginBottom: '10px' };

// --- ESTILOS ADICIONALES (Se mantienen tus originales) ---
const amenitiesGrid = { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '5px 0 20px 0' };
const amenityTag = { backgroundColor: '#f0f0f0', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#555', border: '1px solid #e5e5e5' };

// --- ESTILOS PRINCIPALES ---
const containerStyle = { padding: '120px 5% 60px', backgroundColor: '#fdfdfd', minHeight: '100vh' };
const filterSectionStyle = { display: 'flex', gap: '40px', marginBottom: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' };
const filterGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.85rem', fontWeight: 'bold', color: '#444' };
const selectStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '200px' };
const rangeStyle = { width: '250px', accentColor: '#aa8453' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' };
const cardStyle = { backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #eee', display: 'flex', flexDirection: 'column' };
const imageWrapper = { position: 'relative', height: '180px' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const priceTag = { position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#1a1a1a', color: 'white', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' };
const contentStyle = { padding: '20px', textAlign: 'left', flexGrow: 1, display: 'flex', flexDirection: 'column' };
const categoryStyle = { fontSize: '0.7rem', color: '#aa8453', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' };
const nameStyle = { fontSize: '1.2rem', margin: '5px 0 10px 0', color: '#333' };
const btnStyle = { backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', marginTop: 'auto' };

export default Habitaciones;