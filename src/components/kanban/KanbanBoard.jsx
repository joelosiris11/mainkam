import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { useKanban } from '../../context/KanbanContext';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import TaskDetailModal from './TaskDetailModal';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const { tasks, columns, moveTask, getTasksByColumn } = useKanban();
  const { hasPermission } = useProject();
  const { currentUser } = useAuth();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [initialColumn, setInitialColumn] = useState(null);

  const canWrite = hasPermission('write');

  const handleDragEnd = async (result) => {
    if (!result.destination || !canWrite) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    try {
      await moveTask(draggableId, newStatus);
    } catch (error) {
      console.error('Error al mover tarea:', error);
    }
  };

  const handleCreateTask = (columnId) => {
    if (!canWrite) return;
    setInitialColumn(columnId);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    if (!canWrite) return;
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleCloseModals = () => {
    setShowTaskModal(false);
    setShowDetailModal(false);
    setSelectedTask(null);
    setInitialColumn(null);
  };

  if (!columns.length) {
    return (
      <div className="kanban-empty">
        <p>No hay columnas configuradas para este proyecto</p>
      </div>
    );
  }

  return (
    <div className="kanban-board-container">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTasks = getTasksByColumn(column.id);
            
            return (
              <div key={column.id} className="kanban-column">
                <div 
                  className="column-header"
                  style={{ '--column-color': column.color }}
                >
                  <div className="column-title-section">
                    <h3 className="column-title">{column.title}</h3>
                    <span className="task-count">{columnTasks.length}</span>
                  </div>
                  
                  {canWrite && (
                    <button
                      className="btn-add-task"
                      onClick={() => handleCreateTask(column.id)}
                      title="Agregar tarea"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>

                <Droppable droppableId={column.id} isDropDisabled={!canWrite}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={!canWrite}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                onEdit={() => handleEditTask(task)}
                                onView={() => handleViewTask(task)}
                                isDragging={snapshot.isDragging}
                                canEdit={canWrite}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {columnTasks.length === 0 && (
                        <div className="column-empty">
                          <p>No hay tareas</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          initialColumn={initialColumn}
          onClose={handleCloseModals}
        />
      )}

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseModals}
          onEdit={() => {
            setShowDetailModal(false);
            setShowTaskModal(true);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;

