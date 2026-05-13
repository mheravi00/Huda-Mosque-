import './Sidebar.css';

function Sidebar({ page, setPage, menuItems, schoolItems }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">M</div>
        <div>
          <p className="brand-title">Knowledge. Character. Faith.</p>
          <p className="brand-subtitle">Parent Portal</p>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="school-menu">
        <p className="section-label">School</p>
        {schoolItems.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
