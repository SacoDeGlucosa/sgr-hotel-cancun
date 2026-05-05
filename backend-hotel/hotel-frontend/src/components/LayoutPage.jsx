// Añadimos "blur = false" para que por defecto las imágenes sean nítidas
const LayoutPage = ({ children, backgroundImage, blur = false }) => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Capa de fondo */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Condicionamos el filtro y la escala según la variable 'blur'
        filter: blur ? 'blur(10px)' : 'none', 
        transform: blur ? 'scale(1.1)' : 'none', 
        zIndex: -1
      }}></div>
      
      {/* Capa oscura para legibilidad */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        // Si hay blur, oscurecemos un 50%. Si es nítida, oscurecemos solo un 20%.
        backgroundColor: blur ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
        zIndex: -1
      }}></div>

      <div style={{ paddingTop: '100px' }}>
        {children}
      </div>
    </div>
  );
};

export default LayoutPage;