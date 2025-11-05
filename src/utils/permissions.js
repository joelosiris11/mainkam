export const checkPermission = (userRole, requiredPermission) => {
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage'],
    editor: ['read', 'write'],
    viewer: ['read']
  };

  return permissions[userRole]?.includes(requiredPermission) || false;
};

export const canManageProject = (project, username) => {
  if (!project || !username) return false;
  return project.owner === username || project.roles[username] === 'admin';
};

export const canEditProject = (project, username) => {
  if (!project || !username) return false;
  const userRole = project.roles[username];
  return userRole === 'admin' || userRole === 'editor';
};

export const canViewProject = (project, username) => {
  if (!project || !username) return false;
  return project.members.includes(username);
};

