import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { jobs, applications } = useApp();

  const adminJobs = jobs.filter(job => job.postedBy === user.id);
  const totalApplications = applications.filter(app => 
    adminJobs.some(job => job.id === app.jobId)
  );

  const students = mockUsers.filter(u => u.role === 'student');
  const recentApplications = totalApplications
    .slice(-5)
    .reverse()
    .map(app => ({
      ...app,
      job: jobs.find(job => job.id === app.jobId),
      student: students.find(student => student.id === app.userId)
    }));

  const statusCounts = {
    applied: totalApplications.filter(app => app.status === 'Applied').length,
    reviewed: totalApplications.filter(app => app.status === 'Reviewed').length,
    selected: totalApplications.filter(app => app.status === 'Selected').length,
    rejected: totalApplications.filter(app => app.status === 'Rejected').length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Reviewed':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'Selected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user.name}! Here's your recruitment overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Listings</p>
              <p className="text-2xl font-bold">{adminJobs.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Applications</p>
              <p className="text-2xl font-bold">{totalApplications.length}</p>
            </div>
            <FileText className="w-8 h-8 text-green-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Students Selected</p>
              <p className="text-2xl font-bold">{statusCounts.selected}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Review</p>
              <p className="text-2xl font-bold">{statusCounts.applied}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-100" />
          </div>
        </div>
      </div>

      {/* Recent Activity & Job Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Applications
          </h3>
          {recentApplications.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">No recent applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map(application => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={application.student?.avatar} 
                      alt={application.student?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {application.student?.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {application.job?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Application Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">Pending Review</span>
              </div>
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.applied}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">Under Review</span>
              </div>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.reviewed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Selected</span>
              </div>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.selected}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Not Selected</span>
              </div>
              <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.rejected}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Job Listings
          </h3>
          <a
            href="/admin/manage"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
          >
            Manage All →
          </a>
        </div>

        {adminJobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No job listings yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by posting your first job opportunity.
            </p>
            <a
              href="/post-job"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Post a Job
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {adminJobs.slice(0, 3).map(job => (
              <div key={job.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.company}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{job.applicants} applicants</span>
                      <span>₹{job.stipend.toLocaleString()}</span>
                      <span>{job.workType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
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

export default AdminDashboard;