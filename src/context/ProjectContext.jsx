import { createContext, useContext, useState, useEffect } from 'react';
import { projectsService } from '../services/firebaseService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { checkPermission } from '../utils/permissions';

const ProjectContext = createContext(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject debe usarse dentro de ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState({ owned: [], shared: [], all: [] });
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar proyectos del usuario al autenticarse
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      loadUserProjects();
    } else {
      setProjects({ owned: [], shared: [], all: [] });
      setCurrentProject(null);
    }
  }, [currentUser, isAuthenticated]);

  // Sincronizar proyectos en tiempo real
  useEffect(() => {
    if (!currentUser) return;

    // Si es admin global, escuchar TODOS los proyectos
    let unsubscribe;
    if (currentUser.role === 'admin') {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('isArchived', '==', false));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const owned = updatedProjects.filter(p => p.owner === currentUser.username);
        const shared = updatedProjects.filter(p => p.owner !== currentUser.username);
        
        setProjects({
          owned,
          shared,
          all: updatedProjects
        });
      });
    } else {
      unsubscribe = projectsService.onProjectsSnapshot(
        currentUser.username,
        (updatedProjects) => {
          const owned = updatedProjects.filter(p => p.owner === currentUser.username);
          const shared = updatedProjects.filter(p => p.owner !== currentUser.username);
          
          setProjects({
            owned,
            shared,
            all: updatedProjects
          });
        }
      );
    }

    return () => unsubscribe();
  }, [currentUser]);

  const loadUserProjects = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Si es admin global, cargar TODOS los proyectos
      let userProjects;
      if (currentUser.role === 'admin') {
        const allProjects = await projectsService.getAll();
        const owned = allProjects.filter(p => p.owner === currentUser.username);
        const shared = allProjects.filter(p => p.owner !== currentUser.username && !p.isArchived);
        userProjects = {
          owned,
          shared,
          all: allProjects.filter(p => !p.isArchived)
        };
      } else {
        userProjects = await projectsService.getUserProjects(currentUser.username);
      }
      
      setProjects(userProjects);

      // Restaurar último proyecto si existe
      const lastProjectId = storage.get(STORAGE_KEYS.LAST_PROJECT_ID);
      if (lastProjectId && userProjects.all.some(p => p.id === lastProjectId)) {
        await selectProject(lastProjectId);
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
    setLoading(false);
  };

  const createProject = async (projectData) => {
    if (!currentUser) {
      throw new Error('Debes estar autenticado para crear un proyecto');
    }

    try {
      const newProject = await projectsService.create(projectData, currentUser.username);
      await loadUserProjects();
      return newProject;
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      throw error;
    }
  };

  const selectProject = async (projectId) => {
    try {
      const project = await projectsService.getById(projectId);
      setCurrentProject(project);
      storage.set(STORAGE_KEYS.LAST_PROJECT_ID, projectId);
      return project;
    } catch (error) {
      console.error('Error al seleccionar proyecto:', error);
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      await projectsService.update(projectId, updates);
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({ ...currentProject, ...updates });
      }
      
      await loadUserProjects();
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      throw error;
    }
  };

  const archiveProject = async (projectId) => {
    try {
      await projectsService.archive(projectId);
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
        storage.remove(STORAGE_KEYS.LAST_PROJECT_ID);
      }
      
      await loadUserProjects();
    } catch (error) {
      console.error('Error al archivar proyecto:', error);
      throw error;
    }
  };

  const addMember = async (projectId, username, role = 'editor') => {
    try {
      await projectsService.addMember(projectId, username, role);
      await loadUserProjects();
      
      if (currentProject && currentProject.id === projectId) {
        const updated = await projectsService.getById(projectId);
        setCurrentProject(updated);
      }
    } catch (error) {
      console.error('Error al agregar miembro:', error);
      throw error;
    }
  };

  const removeMember = async (projectId, username) => {
    try {
      await projectsService.removeMember(projectId, username);
      await loadUserProjects();
      
      if (currentProject && currentProject.id === projectId) {
        const updated = await projectsService.getById(projectId);
        setCurrentProject(updated);
      }
    } catch (error) {
      console.error('Error al remover miembro:', error);
      throw error;
    }
  };

  const hasPermission = (permission) => {
    if (!currentProject || !currentUser) return false;
    
    // Los administradores globales tienen todos los permisos
    if (currentUser.role === 'admin') return true;
    
    const userRole = currentProject.roles[currentUser.username];
    return checkPermission(userRole, permission);
  };

  const isProjectOwner = () => {
    if (!currentProject || !currentUser) return false;
    
    // Los administradores globales se consideran owners de todos los proyectos
    if (currentUser.role === 'admin') return true;
    
    return currentProject.owner === currentUser.username;
  };

  const getUserRole = () => {
    if (!currentProject || !currentUser) return null;
    
    // Los administradores globales siempre tienen rol 'admin' en cualquier proyecto
    if (currentUser.role === 'admin') return 'admin';
    
    return currentProject.roles[currentUser.username];
  };

  const value = {
    projects,
    currentProject,
    loading,
    createProject,
    selectProject,
    updateProject,
    archiveProject,
    addMember,
    removeMember,
    hasPermission,
    isProjectOwner,
    getUserRole,
    refreshProjects: loadUserProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;

