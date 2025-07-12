const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint);
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Authentication APIs
  async login(email, password, role) {
    const response = await this.post('/auth/login', { email, password, role });
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async updateProfile(profileData) {
    return this.put('/auth/update-profile', profileData);
  }

  async changePassword(currentPassword, newPassword) {
    return this.put('/auth/change-password', { currentPassword, newPassword });
  }

  // User APIs
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUserProfile(userId) {
    return this.get(`/users/profile/${userId}`);
  }

  async searchUsers(query, role) {
    const params = new URLSearchParams({ q: query });
    if (role) params.append('role', role);
    return this.get(`/users/search?${params.toString()}`);
  }

  async awardXP(action, userId, points) {
    return this.post('/users/award-xp', { action, userId, points });
  }

  async updateUserStats(action) {
    return this.put(`/users/stats/${action}`);
  }

  // Job APIs
  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/jobs${queryString ? `?${queryString}` : ''}`);
  }

  async getJob(jobId) {
    return this.get(`/jobs/${jobId}`);
  }

  async createJob(jobData) {
    return this.post('/jobs', jobData);
  }

  async updateJob(jobId, jobData) {
    return this.put(`/jobs/${jobId}`, jobData);
  }

  async deleteJob(jobId) {
    return this.delete(`/jobs/${jobId}`);
  }

  async getUserJobs(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/jobs/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  async searchJobs(query, filters = {}) {
    const params = new URLSearchParams({ search: query, ...filters });
    return this.get(`/jobs?${params.toString()}`);
  }

  // Application APIs
  async applyForJob(applicationData) {
    return this.post('/applications', applicationData);
  }

  async getMyApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/applications${queryString ? `?${queryString}` : ''}`);
  }

  async getJobApplications(jobId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/applications/job/${jobId}${queryString ? `?${queryString}` : ''}`);
  }

  async getApplication(applicationId) {
    return this.get(`/applications/${applicationId}`);
  }

  async updateApplicationStatus(applicationId, status, feedback) {
    return this.put(`/applications/${applicationId}/status`, { status, feedback });
  }

  async withdrawApplication(applicationId, reason) {
    return this.put(`/applications/${applicationId}/withdraw`, { reason });
  }

  async getApplicationStats() {
    return this.get('/applications/stats/user');
  }

  // Leaderboard APIs
  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/leaderboard${queryString ? `?${queryString}` : ''}`);
  }

  async getTopPerformers(category = 'xp', limit = 10) {
    return this.get(`/leaderboard/top?category=${category}&limit=${limit}`);
  }

  async getUniversityLeaderboard(university, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/leaderboard/university/${encodeURIComponent(university)}${queryString ? `?${queryString}` : ''}`);
  }

  async getUserRank(userId) {
    return this.get(`/leaderboard/user/${userId}`);
  }

  async getLeaderboardStats() {
    return this.get('/leaderboard/stats');
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

export default new ApiService();
