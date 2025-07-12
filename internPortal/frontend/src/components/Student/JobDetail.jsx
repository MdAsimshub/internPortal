import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Users, 
  Mail,
  Eye,
  BookOpen,
  Award
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, applyToJob } = useApp();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);

  const userApplications = applications.filter(app => 
    user ? app.applicant?._id === user._id || app.applicant === user._id : false
  );

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await apiService.getJob(id);
        if (response.success) {
          setJob(response.data.job);
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  const hasApplied = () => {
    return userApplications.some(app => 
      (app.job?._id || app.job) === (job?._id || job?.id)
    );
  };

  const handleApply = async () => {
    if (!user) {
      alert('Please login to apply for jobs.');
      return;
    }

    if (hasApplied()) {
      alert('You have already applied for this position.');
      return;
    }

    setApplying(true);
    try {
      const applicationData = {
        coverLetter: 'I am interested in this position and believe I would be a great fit.',
        resume: 'https://example.com/resume.pdf' // You might want to add a file upload feature
      };

      const application = await applyToJob(job._id, applicationData);
      
      if (application) {
        alert('Application submitted successfully! You earned 50 XP!');
        // Update job applicant count locally
        setJob(prev => ({
          ...prev,
          applicants: prev.applicants + 1
        }));
      } else {
        alert('Failed to submit application.');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      if (error.message.includes('already applied')) {
        alert('You have already applied for this position.');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } finally {
      setApplying(false);
    }
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
      case 'On-site':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Hybrid':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Job not found'}
          </h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(job.deadline) < new Date();
  const daysRemaining = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </button>

      {/* Job Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.type)}`}>
                {job.type}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkTypeColor(job.workType)}`}>
                {job.workType}
              </span>
              {isExpired && (
                <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-sm font-medium">
                  Expired
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {job.title}
            </h1>
            <p className="text-xl text-primary-600 dark:text-primary-400 font-semibold mb-4">
              {job.company}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <DollarSign className="w-5 h-5 mr-2" />
                <span>₹{job.stipend.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5 mr-2" />
                <span>{job.duration}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5 mr-2" />
                <span>{job.applicants} applicants</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Eye className="w-5 h-5 mr-2" />
                <span>{job.views} views</span>
              </div>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
              <Calendar className="w-5 h-5 mr-2" />
              <span>
                Deadline: {new Date(job.deadline).toLocaleDateString()}
                {!isExpired && (
                  <span className="ml-2 text-sm">
                    ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                  </span>
                )}
              </span>
            </div>

            {job.location && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{job.location}</span>
              </div>
            )}
          </div>

          <div className="lg:ml-8 mt-6 lg:mt-0">
            {user ? (
              <button
                onClick={handleApply}
                disabled={hasApplied() || isExpired || applying}
                className={`w-full px-8 py-3 rounded-lg font-medium transition-colors ${
                  hasApplied() || isExpired
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                    : applying
                    ? 'bg-primary-400 text-white cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {applying 
                  ? 'Applying...' 
                  : hasApplied() 
                  ? 'Applied' 
                  : isExpired 
                  ? 'Expired' 
                  : 'Apply Now'
                }
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Login to Apply
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Job Description
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Requirements
              </h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600 dark:text-gray-400">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2" />
                Preferred Qualifications
              </h2>
              <ul className="space-y-2">
                {job.qualifications.map((qual, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600 dark:text-gray-400">{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Job Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Domain</span>
                <p className="font-medium text-gray-900 dark:text-white">{job.domain}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Posted</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              {job.contactEmail && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Contact</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {job.contactEmail}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Skills/Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Posted By */}
          {job.postedBy && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Posted By
              </h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  {job.postedBy.name?.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.postedBy.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {job.postedBy.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
