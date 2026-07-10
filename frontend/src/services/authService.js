import api from './api';

// Local mock database for admin/staff logins when backend is down
const registeredStaff = new Map();

registeredStaff.set('admin@xebia.com', {
  email: 'admin@xebia.com',
  fullName: 'System Admin',
  password: 'admin123',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=System+Admin'
});

registeredStaff.set('john.doe@xebia.com', {
  email: 'john.doe@xebia.com',
  fullName: 'John Doe (Trainer)',
  password: 'trainer123',
  role: 'trainer',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=John+Doe'
});

registeredStaff.set('sarah.c@xebia.com', {
  email: 'sarah.c@xebia.com',
  fullName: 'Sarah Connor (Manager)',
  password: 'manager123',
  role: 'manager',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah+Connor'
});

export const authService = {
  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check local staff mock store first
    if (registeredStaff.has(cleanEmail)) {
      const staff = registeredStaff.get(cleanEmail);
      if (staff.password === password) {
        return {
          data: {
            accessToken: 'mock-admin-jwt-token-' + Date.now(),
            refreshToken: 'mock-admin-refresh-token-' + Date.now(),
            user: {
              email: staff.email,
              fullName: staff.fullName,
              role: staff.role,
              avatar: staff.avatar
            }
          }
        };
      }
    }

    const response = await api.post('/auth/login', { email, password });
    return response.data; // { message: "...", data: { accessToken, refreshToken, user: { ... } } }
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};
