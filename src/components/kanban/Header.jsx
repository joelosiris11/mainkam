import { useKanban } from '../../context/KanbanContext';
import './Header.css';

const Header = () => {
  const { getStats } = useKanban();
  const stats = getStats();
  return (
    <header className="kanban-header">
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Completadas</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-label">Horas</span>
            <span className="stat-value">{stats.totalHours}</span>
          </div>
        </div>

        <div className="stat-card priority-high">
          <div className="stat-icon">⬆️</div>
          <div className="stat-info">
            <span className="stat-label">Alta</span>
            <span className="stat-value">{stats.byPriority.high}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

