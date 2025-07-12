import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign,
  Briefcase,
  Users
} from 'lucide-react';

const JobList = () => {
  const { jobs, applications, applyToJob, loadJobs, loading } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    domain: '',
    type: '',
    workType: '',
    stipendRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load jobs when component mounts
  useEffect(() => {
    loadJobs();
  }, []);

  const userApplications = applications.filter(app => 
    user ? app.applicant?._id === user._id || app.applicant === user._id : false
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDomain = !filters.domain || job.domain === filters.domain;
      const matchesType = !filters.type || job.type === filters.type;
      const matchesWorkType = !filters.workType || job.workType === filters.workType;
      
      let matchesStipend = true;
      if (filters.stipendRange) {
        const [min, max] = filters.stipendRange.split('-').map(Number);
        matchesStipend = job.stipend >= min && (!max || job.stipend <= max);
      }

      return matchesSearch && matchesDomain && matchesType && matchesWorkType && matchesStipend;
    });
  }, [jobs, searchTerm, filters]);

  const handleApply = async (jobId) => {
    if (!user) {
      alert('Please login to apply for jobs.');
      return;
    }

    try {
      const applicationData = {
        coverLetter: 'I am interested in this position and believe I would be a great fit.',
        resume: 'https://example.com/resume.pdf' // You might want to add a file upload feature
      };

      const application = await applyToJob(jobId, applicationData);
      
      if (application) {
        alert('Application submitted successfully! You earned 50 XP!');
        // Optionally reload applications
      } else {
        alert('Failed to submit application or you have already applied.');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      if (error.message.includes('already applied')) {
        alert('You have already applied for this position.');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    }
  };

  const hasApplied = (jobId) => {
    return userApplications.some(app => 
      (app.job?._id || app.job) === (jobId._id || jobId)
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Internship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Part-time':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getWorkTypeColor = (workType) => {
    switch (workType) {
      case 'Remote':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'In-office':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Hybrid':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Job Opportunities
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover your next career opportunity
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.domain}
                onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Domains</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Data Science">Data Science</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>

              <select
                value={filters.workType}
                onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Work Types</option>
                <option value="Remote">Remote</option>
                <option value="In-office">In-office</option>
                <option value="Hybrid">Hybrid</option>
              </select>

              <select
                value={filters.stipendRange}
                onChange={(e) => setFilters({ ...filters, stipendRange: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Stipends</option>
                <option value="0-15000">₹0 - ₹15,000</option>
                <option value="15000-30000">₹15,000 - ₹30,000</option>
                <option value="30000-50000">₹30,000 - ₹50,000</option>
                <option value="50000-">₹50,000+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Found {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'}
        </p>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {filteredJobs.map(job => (
          <div
            key={job._id || job.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h3>
                    <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mb-3">
                      {job.company}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.type)}`}>
                      {job.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkTypeColor(job.workType)}`}>
                      {job.workType}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ₹{job.stipend.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {job.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {job.applicants} applicants
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:ml-6">
                <Link
                  to={`/jobs/${job._id || job.id}`}
                  className="px-6 py-2 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
                >
                  View Details
                </Link>
                {user && (
                  <button
                    onClick={() => handleApply(job._id || job.id)}
                    disabled={hasApplied(job._id || job.id)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      hasApplied(job._id || job.id)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {hasApplied(job._id || job.id) ? 'Applied' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No jobs found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobList;