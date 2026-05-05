import React, { useState } from 'react';
import LayoutPage from './LayoutPage';
import { useNavigate } from 'react-router-dom';

// Librería de calendario
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './CalendarioCustom.css'; 
// NUEVO: Importa el CSS de la galería
import './GaleriaInicio.css'; 

const Inicio = () => {
    const navigate = useNavigate();
    
    const [showDestinos, setShowDestinos] = useState(false);
    const [showHuespedes, setShowHuespedes] = useState(false);
    const [destino, setDestino] = useState("");
    const [huespedes, setHuespedes] = useState({ habitaciones: 1, adultos: 2, ninos: 0 });
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);

    const destinosPopulares = ["Cancún, México", "Bogotá, Colombia", "Punta Cana, Rep. Dominicana", "Madrid, España"];

    const instalaciones = [
        { id: 1, title: 'Piscinas Infinitas', img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000' },
        { id: 2, title: 'Restaurante Gourmet', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000' },
        { id: 3, title: 'Playa Privada', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000' },
        { id: 4, title: 'Master Suite', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000' }
    ];

    const onChangeDates = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const updateHuespedes = (campo, operacion) => {
        setHuespedes(prev => ({
        ...prev,
        [campo]: operacion === '+' ? prev[campo] + 1 : Math.max(campo === 'ninos' ? 0 : 1, prev[campo] - 1)
        }));
    };

    // --- NUEVO: ESTA ES LA FUNCIÓN QUE CONECTA EL INICIO CON LAS HABITACIONES ---
    const handleBuscar = () => {
        // Navegamos a la ruta, pasándole los datos exactos del buscador como parámetros
        navigate(`/habitaciones?adultos=${huespedes.adultos}&niños=${huespedes.ninos}`);
    };

    return (
        <LayoutPage backgroundImage="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1920&q=80">
        
        {/* SECCIÓN 1: BUSCADOR (HERO) */}
        <div style={heroSectionStyle}>
            <h1 style={titleStyle}>#Elige. Reserva. Disfruta.</h1>

            <div style={{ width: '100%', maxWidth: '1150px', position: 'relative', marginTop: '-20px' }}>
            <div style={tabStyle}>Hotel</div>

            <form style={searchBarStyle}>
                <div style={inputGroupStyle} onClick={() => {setShowDestinos(!showDestinos); setShowHuespedes(false)}}>
                <label style={labelStyle}>¿Dónde quiere ir?</label>
                <input type="text" placeholder="Busque hotel, destino..." value={destino} readOnly style={inputFieldStyle} />
                {showDestinos && (
                    <div style={dropdownStyle}>
                    {destinosPopulares.map(d => (
                        <div key={d} style={optionStyle} onClick={() => setDestino(d)}>{d}</div>
                    ))}
                    </div>
                )}
                </div>

                <div style={{ ...inputGroupStyle, flex: 1.5 }}>
                <label style={labelStyle}>Fechas (Entrada - Salida)</label>
                <DatePicker
                    selected={startDate}
                    onChange={onChangeDates}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    monthsShown={2}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="bottom"
                    popperModifiers={[{ name: "flip", options: { fallbackPlacements: [] } }]}
                    customInput={
                    <button type="button" style={inputFieldStyle}>
                        {startDate ? startDate.toLocaleDateString() : "Entrada"} - {endDate ? endDate.toLocaleDateString() : "Salida"}
                    </button>
                    }
                />
                </div>

                <div style={inputGroupStyle} onClick={() => {setShowHuespedes(!showHuespedes); setShowDestinos(false)}}>
                <label style={labelStyle}>Habitaciones y huéspedes</label>
                <div style={inputFieldStyle}>
                    {huespedes.habitaciones} Hab, {huespedes.adultos + huespedes.ninos} Pers.
                </div>
                {showHuespedes && (
                    <div style={huespedesCardStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={counterRow}>
                        <span>Habitaciones</span>
                        <div style={counterControls}>
                        <button type="button" onClick={() => updateHuespedes('habitaciones', '-')} style={circleBtn}>-</button>
                        <span style={counterVal}>{huespedes.habitaciones}</span>
                        <button type="button" onClick={() => updateHuespedes('habitaciones', '+')} style={circleBtn}>+</button>
                        </div>
                    </div>
                    <div style={counterRow}>
                        <span>Adultos</span>
                        <div style={counterControls}>
                        <button type="button" onClick={() => updateHuespedes('adultos', '-')} style={circleBtn}>-</button>
                        <span style={counterVal}>{huespedes.adultos}</span>
                        <button type="button" onClick={() => updateHuespedes('adultos', '+')} style={circleBtn}>+</button>
                        </div>
                    </div>
                    <div style={counterRow}>
                        <span>Niños</span>
                        <div style={counterControls}>
                        <button type="button" onClick={() => updateHuespedes('ninos', '-')} style={circleBtn}>-</button>
                        <span style={counterVal}>{huespedes.ninos}</span>
                        <button type="button" onClick={() => updateHuespedes('ninos', '+')} style={circleBtn}>+</button>
                        </div>
                    </div>
                    <button type="button" onClick={() => setShowHuespedes(false)} style={btnAplicar}>Aplicar</button>
                    </div>
                )}
                </div>

                {/* NUEVO: Cambiamos el onClick para que ejecute nuestra función handleBuscar */}
                <button type="button" onClick={handleBuscar} style={btnBuscarStyle}>Buscar</button>
            </form>
            </div>
        </div>

        {/* SECCIÓN 2: INSTALACIONES (APARECE AL BAJAR) */}
        <div style={gallerySectionStyle}>
          <h2 style={galleryTitleStyle}>Viva y disfrute la experiencia completa</h2>
          
          <div style={gridStyle}>
            {instalaciones.map((item) => (
              <div 
                key={item.id} 
                className="galeria-card"
                style={item.title === 'Master Suite' ? { gridColumn: '1 / -1', width: '100%' } : {}}
              >
                <img src={item.img} alt={item.title} className="galeria-imagen" />
                
                <div className="galeria-overlay">
                  <span className="galeria-texto">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        </LayoutPage>
    );
};

// --- ESTILOS ---
const heroSectionStyle = { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' };
const gallerySectionStyle = { padding: '100px 5%', backgroundColor: '#fff', textAlign: 'center' };
const galleryTitleStyle = { fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '50px', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '2px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', justifyContent: 'center', justifyItems: 'center' };
const titleStyle = { color: 'white', fontSize: '3.8rem', fontWeight: 'bold', textShadow: '2px 2px 10px rgba(0,0,0,0.5)', marginBottom: '20px', textAlign: 'center' };
const tabStyle = { backgroundColor: 'rgba(25, 25, 25, 0.95)', color: 'white', padding: '12px 35px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', fontWeight: 'bold', width: 'fit-content', fontSize: '0.9rem' };
const searchBarStyle = { backgroundColor: 'rgba(25, 25, 25, 0.95)', borderRadius: '0 8px 8px 8px', padding: '15px 25px', display: 'flex', gap: '15px', alignItems: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', cursor: 'pointer', padding: '5px 10px', alignItems: 'center' };
const labelStyle = { color: '#999', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' };
const inputFieldStyle = { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '0.95rem', outline: 'none', width: '100%', cursor: 'pointer', textAlign: 'center', padding: 0 };
const dropdownStyle = { position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', width: '220px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100 };
const optionStyle = { padding: '12px 20px', color: '#333', fontSize: '0.9rem', borderBottom: '1px solid #eee', cursor: 'pointer' };
const huespedesCardStyle = { position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', width: '280px', backgroundColor: 'white', borderRadius: '12px', padding: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '15px' };
const counterRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#333' };
const counterControls = { display: 'flex', alignItems: 'center', gap: '15px' };
const circleBtn = { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer' };
const counterVal = { minWidth: '20px', textAlign: 'center' };
const btnAplicar = { marginTop: '10px', padding: '10px', backgroundColor: '#1a1a1a', color: 'white', borderRadius: '6px', cursor: 'pointer' };
const btnBuscarStyle = { backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '50px', padding: '14px 40px', fontWeight: 'bold', cursor: 'pointer' };

export default Inicio;