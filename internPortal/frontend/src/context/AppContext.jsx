import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load jobs on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Load applications when user is available (from parent AuthContext)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserApplications();
    }
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobs();
      if (response.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData) => {
    try {
      const response = await apiService.createJob(jobData);
      if (response.success) {
        setJobs([response.data.job, ...jobs]);
        return response.data.job;
      }
      return null;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  };

  const updateJob = async (jobId, updates) => {
    try {
      const response = await apiService.updateJob(jobId, updates);
      if (response.success) {
        setJobs(jobs.map(job => 
          job._id === jobId ? response.data.job : job
        ));
        return response.data.job;
      }
      return null;
    } catch (error) {
      console.error('Failed to update job:', error);
      throw error;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const response = await apiService.deleteJob(jobId);
      if (response.success) {
        setJobs(jobs.filter(job => job._id !== jobId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete job:', error);
      throw error;
    }
  };

  const applyToJob = async (jobId, applicationData) => {
    try {
      const response = await apiService.applyForJob({
        jobId,
        ...applicationData
      });
      
      if (response.success) {
        // Update local job applicant count
        setJobs(jobs.map(job => 
          job._id === jobId 
            ? { ...job, applicants: job.applicants + 1 }
            : job
        ));
        return response.data.application;
      }
      return null;
    } catch (error) {
      console.error('Failed to apply for job:', error);
      throw error;
    }
  };

  const loadUserApplications = async () => {
    try {
      const response = await apiService.getMyApplications();
      if (response.success) {
        setApplications(response.data.applications);
        return response.data.applications;
      }
      return [];
    } catch (error) {
      console.error('Failed to load applications:', error);
      return [];
    }
  };

  const updateApplicationStatus = async (applicationId, status, feedback) => {
    try {
      const response = await apiService.updateApplicationStatus(applicationId, status, feedback);
      if (response.success) {
        setApplications(applications.map(app =>
          app._id === applicationId ? response.data.application : app
        ));
        return response.data.application;
      }
      return null;
    } catch (error) {
      console.error('Failed to update application status:', error);
      throw error;
    }
  };

  const withdrawApplication = async (applicationId, reason) => {
    try {
      const response = await apiService.withdrawApplication(applicationId, reason);
      if (response.success) {
        setApplications(applications.map(app =>
          app._id === applicationId ? response.data.application : app
        ));
        return response.data.application;
      }
      return null;
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      throw error;
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const value = {
    jobs,
    applications,
    darkMode,
    loading,
    addJob,
    updateJob,
    deleteJob,
    applyToJob,
    loadUserApplications,
    updateApplicationStatus,
    withdrawApplication,
    toggleDarkMode,
    loadJobs
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};