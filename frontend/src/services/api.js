const API_BASE_URL = 'http://localhost:8081/api';

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

export const testBackend = async () => {
  const response = await fetch(`${API_BASE_URL}/user/test`);
  return response.text();
};
