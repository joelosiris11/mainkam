import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { KanbanProvider } from '../../context/KanbanContext';
import Sidebar from '../layout/Sidebar';
import Header from './Header';
import KanbanBoard from './KanbanBoard';
import ProjectSettings from '../projects/ProjectSettings';
import MembersManager from '../projects/MembersManager';
import ColumnManager from './ColumnManager';
import './ProjectView.css';

const ProjectView = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject, loading } = useProject();
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);

  // Seleccionar proyecto si no está seleccionado
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      selectProject(projectId);
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  if (!currentProject) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <KanbanProvider>
      <div className="project-view">
        <Sidebar
          onOpenSettings={() => setShowSettings(true)}
          onOpenMembers={() => setShowMembers(true)}
          onOpenColumnManager={() => setShowColumnManager(true)}
        />
        
        <main className="project-main">
          <Header />
          <KanbanBoard />
        </main>
        
        {showSettings && (
          <ProjectSettings onClose={() => setShowSettings(false)} />
        )}
        
        {showMembers && (
          <MembersManager onClose={() => setShowMembers(false)} />
        )}
        
        {showColumnManager && (
          <ColumnManager onClose={() => setShowColumnManager(false)} />
        )}
      </div>
    </KanbanProvider>
  );
};

export default ProjectView;

