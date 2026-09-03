import React from 'react';

function Footer() {
  const anioActual = new Date().getFullYear();
  
  return (
    <footer className="bg-white text-center text-muted py-3 border-top mt-auto">
      <div className="container">
        <small>&copy; {anioActual} Liceo Antonio de Toledo - Sistema GAE. Todos los derechos reservados.</small>
      </div>
    </footer>
  );
}

export default Footer;