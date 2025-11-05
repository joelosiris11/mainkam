import { Users, Calendar } from 'lucide-react';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div 
      className="project-card"
      onClick={onClick}
      style={{ '--project-color': project.color }}
    >
      <div className="project-card-header">
        <div className="project-icon">{project.icon}</div>
        <div className="project-owner-badge">
          {project.owner}
        </div>
      </div>

      <div className="project-card-body">
        <h3 className="project-name">{project.name}</h3>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
      </div>

      <div className="project-card-footer">
        <div className="project-info">
          <div className="info-item">
            <Users size={14} />
            <span>{project.members?.length || 0} miembros</span>
          </div>
          <div className="info-item">
            <Calendar size={14} />
            <span>{formatDate(project.updatedAt || project.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

