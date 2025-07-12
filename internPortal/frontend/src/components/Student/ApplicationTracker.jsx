import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Briefcase,
  DollarSign
} from 'lucide-react';

const ApplicationTracker = () => {
  const { user } = useAuth();
  const { applications, jobs } = useApp();

  const userApplications = applications
    .filter(app => app.userId === user.id)
    .map(app => ({
      ...app,
      job: jobs.find(job => job.id === app.jobId)
    }))
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Reviewed':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'Selected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'Selected':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const statusCounts = {
    applied: userApplications.filter(app => app.status === 'Applied').length,
    reviewed: userApplications.filter(app => app.status === 'Reviewed').length,
    selected: userApplications.filter(app => app.status === 'Selected').length,
    rejected: userApplications.filter(app => app.status === 'Rejected').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Applications
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track the status of your job applications
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusCounts.applied}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Under Review</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusCounts.reviewed}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Selected</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.selected}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Not Selected</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statusCounts.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Applications ({userApplications.length})
          </h2>
        </div>

        {userApplications.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start applying to job opportunities to track them here.
            </p>
            <a
              href="/jobs"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Jobs
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {userApplications.map(application => (
              <div key={application.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {application.job?.title}
                        </h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium mb-2">
                          {application.job?.company}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ₹{application.job?.stipend?.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Applied: {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Updated: {new Date(application.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>

                    {application.job?.tags && (
                      <div className="flex flex-wrap gap-2">
                        {application.job.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {application.job.tags.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 dark:text-gray-400 rounded text-sm">
                            +{application.job.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center mt-4 lg:mt-0 lg:ml-6">
                    <div className="flex items-center mr-4">
                      {getStatusIcon(application.status)}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {application.status}
                      </span>
                    </div>
                    <a
                      href={`/jobs/${application.job?.id}`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
                    >
                      View Job →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker;