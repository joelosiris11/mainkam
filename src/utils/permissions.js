export const checkPermission = (userRole, requiredPermission) => {
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage'],
    editor: ['read', 'write'],
    viewer: ['read']
  };

  return permissions[userRole]?.includes(requiredPermission) || false;
};

export const canManageProject = (project, username, userGlobalRole = null) => {
  if (!project || !username) return false;
  
  // Los administradores globales pueden gestionar cualquier proyecto
  if (userGlobalRole === 'admin') return true;
  
  return project.owner === username || project.roles[username] === 'admin';
};

export const canEditProject = (project, username, userGlobalRole = null) => {
  if (!project || !username) return false;
  
  // Los administradores globales pueden editar cualquier proyecto
  if (userGlobalRole === 'admin') return true;
  
  const userRole = project.roles[username];
  return userRole === 'admin' || userRole === 'editor';
};

export const canViewProject = (project, username, userGlobalRole = null) => {
  if (!project || !username) return false;
  
  // Los administradores globales pueden ver cualquier proyecto
  if (userGlobalRole === 'admin') return true;
  
  return project.members.includes(username);
};

