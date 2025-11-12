import { createContext, useContext, useState, useEffect } from 'react';
import { tasksService, columnsService } from '../services/firebaseService';
import { useProject } from './ProjectContext';

const KanbanContext = createContext(null);

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban debe usarse dentro de KanbanProvider');
  }
  return context;
};

export const KanbanProvider = ({ children }) => {
  const { currentProject } = useProject();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos cuando cambia el proyecto actual
  useEffect(() => {
    if (currentProject) {
      loadProjectData();
    } else {
      setTasks([]);
      setColumns([]);
    }
  }, [currentProject]);

  // Sincronizar tareas en tiempo real
  useEffect(() => {
    if (!currentProject) return;

    const unsubscribe = tasksService.onTasksSnapshot(
      currentProject.id,
      (updatedTasks) => {
        setTasks(updatedTasks);
      }
    );

    return () => unsubscribe();
  }, [currentProject]);

  // Sincronizar columnas en tiempo real
  useEffect(() => {
    if (!currentProject) return;

    const unsubscribe = columnsService.onColumnsSnapshot(
      currentProject.id,
      (updatedColumns) => {
        setColumns(updatedColumns);
      }
    );

    return () => unsubscribe();
  }, [currentProject]);

  const loadProjectData = async () => {
    if (!currentProject) return;

    setLoading(true);
    try {
      const [projectTasks, projectColumns] = await Promise.all([
        tasksService.getAll(currentProject.id),
        columnsService.getAll(currentProject.id)
      ]);

      setTasks(projectTasks);
      setColumns(projectColumns);
    } catch (error) {
      console.error('Error al cargar datos del proyecto:', error);
    }
    setLoading(false);
  };

  const addTask = async (taskData) => {
    if (!currentProject) {
      throw new Error('No hay proyecto seleccionado');
    }

    try {
      const newTask = await tasksService.create(currentProject.id, taskData);
      return newTask;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    if (!currentProject) return;

    try {
      await tasksService.update(currentProject.id, taskId, updates);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    if (!currentProject) return;

    try {
      await tasksService.delete(currentProject.id, taskId);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      throw error;
    }
  };

  const moveTask = async (taskId, newStatus) => {
    if (!currentProject) return;

    try {
      await tasksService.update(currentProject.id, taskId, { status: newStatus });
    } catch (error) {
      console.error('Error al mover tarea:', error);
      throw error;
    }
  };

  const addComment = async (taskId, commentText, author) => {
    if (!currentProject) return;

    try {
      const comment = {
        text: commentText,
        author: author
      };
      await tasksService.addComment(currentProject.id, taskId, comment);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error;
    }
  };

  const deleteComment = async (taskId, commentId) => {
    if (!currentProject) return;

    try {
      await tasksService.deleteComment(currentProject.id, taskId, commentId);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  };

  const addColumn = async (columnData) => {
    if (!currentProject) return;

    try {
      const newColumn = await columnsService.create(currentProject.id, columnData);
      return newColumn;
    } catch (error) {
      console.error('Error al crear columna:', error);
      throw error;
    }
  };

  const updateColumn = async (columnId, updates) => {
    if (!currentProject) return;

    try {
      await columnsService.update(currentProject.id, columnId, updates);
    } catch (error) {
      console.error('Error al actualizar columna:', error);
      throw error;
    }
  };

  const deleteColumn = async (columnId) => {
    if (!currentProject) return;

    try {
      // Verificar si hay tareas en esta columna
      const tasksInColumn = tasks.filter(t => t.status === columnId);
      if (tasksInColumn.length > 0) {
        throw new Error('No puedes eliminar una columna que contiene tareas');
      }

      await columnsService.delete(currentProject.id, columnId);
    } catch (error) {
      console.error('Error al eliminar columna:', error);
      throw error;
    }
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => task.status === columnId);
  };

  const getStats = () => {
    // Excluir tareas del backlog de todas las estadísticas
    const activeTasks = tasks.filter(t => t.status !== 'backlog');
    const totalTasks = activeTasks.length;
    const completedColumn = columns.find(c => c.id === 'completed');
    const completedTasks = completedColumn 
      ? activeTasks.filter(t => t.status === 'completed').length 
      : 0;

    const tasksByPriority = {
      high: activeTasks.filter(t => t.priority === 'high').length,
      medium: activeTasks.filter(t => t.priority === 'medium').length,
      low: activeTasks.filter(t => t.priority === 'low').length
    };

    const totalHours = activeTasks.reduce((sum, task) => sum + (task.hours || 0), 0);

    return {
      total: totalTasks,
      completed: completedTasks,
      pending: totalTasks - completedTasks,
      byPriority: tasksByPriority,
      totalHours
    };
  };

  const value = {
    tasks,
    columns,
    loading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    deleteComment,
    addColumn,
    updateColumn,
    deleteColumn,
    getTasksByColumn,
    getStats,
    refreshData: loadProjectData
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};

export default KanbanContext;

