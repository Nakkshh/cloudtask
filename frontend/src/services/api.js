const API_BASE_URL = 'http://localhost:8081/api';

// ============= USER APIs =============
export const syncUserProfile = async (user) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoUrl: user.photoURL || null,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync user profile');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error syncing user profile:', error);
    throw error;
  }
};

// ============= PROJECT APIs =============
export const createProject = async (name, description, firebaseUid) => {
  const response = await fetch(`${API_BASE_URL}/project?firebaseUid=${firebaseUid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return response.json();
};

export const getUserProjects = async (firebaseUid) => {
  const response = await fetch(`${API_BASE_URL}/project/user/${firebaseUid}`);

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
};

export const getProject = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/project/${projectId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }

  return response.json();
};

export const deleteProject = async (projectId, firebaseUid) => {
  const response = await fetch(`${API_BASE_URL}/project/${projectId}?firebaseUid=${firebaseUid}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
};

// ============= TASK APIs =============
export const createTask = async (title, description, projectId) => {
  const response = await fetch(`${API_BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, projectId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
};

export const getProjectTasks = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/task/project/${projectId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}/status?status=${status}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to update task status');
  }

  return response.json();
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
};
