export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

export const requireAdmin = (user, navigate) => {
  if (!isAdmin(user)) {
    navigate('/');
    return false;
  }
  return true;
};

export const isAuthenticated = (user) => {
  return user !== null;
}; 