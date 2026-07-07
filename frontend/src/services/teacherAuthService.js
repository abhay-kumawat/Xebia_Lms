import api from '@/services/api';

// Local mock database for teacher logins
const registeredTeachers = new Map();

// Prepopulate with default teacher credential
registeredTeachers.set('teacher@xebia.com', {
  email: 'teacher@xebia.com',
  fullName: 'Prof. Abhay Kumawat',
  password: 'teacher123',
  role: 'teacher',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Prof+Abhay'
});

export const teacherAuthService = {
  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check local teacher mock store
    if (registeredTeachers.has(cleanEmail)) {
      const teacher = registeredTeachers.get(cleanEmail);
      if (teacher.password === password) {
        return {
          accessToken: 'mock-teacher-jwt-token-' + Date.now(),
          refreshToken: 'mock-teacher-refresh-token-' + Date.now(),
          user: {
            email: teacher.email,
            fullName: teacher.fullName,
            role: 'teacher',
            avatar: teacher.avatar
          }
        };
      }
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid Email or Password.';
      throw new Error(msg);
    }
  },

  register: async (fullName, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    registeredTeachers.set(cleanEmail, {
      email: cleanEmail,
      fullName: fullName,
      password: password,
      role: 'teacher',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
    });

    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      return response.data;
    } catch (err) {
      return { message: 'Mock teacher registration successful', data: null };
    }
  }
};
