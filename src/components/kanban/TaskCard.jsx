import { Clock, User, MessageCircle, RotateCcw } from 'lucide-react';
import { TASK_TYPES, TASK_PRIORITIES } from '../../utils/roles';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { useKanban } from '../../context/KanbanContext';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onView, isDragging, canEdit }) => {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  const { updateTask } = useKanban();

  const canResetHours = () => {
    if (!currentUser || !currentProject) return false;
    // Verificar si es admin global
    if (currentUser.role === 'admin') return true;
    // Verificar si es project manager (rol global pm)
    if (currentUser.role === 'pm') return true;
    // Verificar si es admin del proyecto
    const projectRole = currentProject.roles?.[currentUser.username];
    if (projectRole === 'admin') return true;
    return false;
  };

  const handleResetHours = async (e) => {
    e.stopPropagation();
    if (!canResetHours()) return;
    
    try {
      await updateTask(task.id, { hours: 0 });
    } catch (error) {
      console.error('Error al resetear horas:', error);
      alert('Error al resetear las horas');
    }
  };
  const taskType = TASK_TYPES[task.type] || TASK_TYPES.general;
  const taskPriority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.medium;

  const handleClick = (e) => {
    // No hacer nada si se está arrastrando
    if (isDragging) return;
    
    e.stopPropagation();
    
    if (e.detail === 2 && canEdit) {
      // Doble click para editar
      onEdit();
    } else {
      // Click simple para ver detalles
      onView();
    }
  };

  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      style={{ '--task-type-color': taskType.color }}
    >
      <div className="task-header">
        <div className="task-type" title={taskType.name}>
          <span>{taskType.icon}</span>
        </div>
        <div 
          className={`task-priority priority-${task.priority}`}
          title={`Prioridad ${taskPriority.name}`}
        >
          <span>{taskPriority.icon}</span>
        </div>
      </div>

      <h4 className="task-title">{task.title}</h4>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <div className="task-meta">
          {task.hours > 0 && (
            <div className="meta-item" title={`${task.hours} horas estimadas`}>
              <Clock size={14} />
              <span>{task.hours}h</span>
              {canResetHours() && (
                <button
                  className="btn-reset-hours"
                  onClick={handleResetHours}
                  title="Resetear horas a 0"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          )}
          
          {task.assignedTo && (
            <div className="meta-item" title={`Asignado a ${task.assignedTo}`}>
              <User size={14} />
              <span>{task.assignedTo}</span>
            </div>
          )}
          
          {task.comments && task.comments.length > 0 && (
            <div className="meta-item" title={`${task.comments.length} comentarios`}>
              <MessageCircle size={14} />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
          {task.tags.length > 3 && (
            <span className="tag">+{task.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;

