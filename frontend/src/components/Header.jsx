import React from 'react';

function Header() {
  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-4">
        <span className="navbar-brand fw-bold mb-0 h1 fs-5">
          <i className="bi bi-mortarboard-fill me-2"></i>Liceo Antonio de Toledo
        </span>
        <span className="badge bg-white text-primary fw-bold px-3 py-2 fs-6">
          GAE
        </span>
      </div>
    </nav>
  );
}

export default Header;