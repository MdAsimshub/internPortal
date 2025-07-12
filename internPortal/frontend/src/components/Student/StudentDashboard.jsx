import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Briefcase, 
  FileText, 
  Trophy, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { jobs, applications } = useApp();

  const userApplications = applications.filter(app => app.userId === user.id);
  const recentJobs = jobs.slice(0, 3);

  const statusCounts = {
    applied: userApplications.filter(app => app.status === 'Applied').length,
    reviewed: userApplications.filter(app => app.status === 'Reviewed').length,
    selected: userApplications.filter(app => app.status === 'Selected').length,
    rejected: userApplications.filter(app => app.status === 'Rejected').length
  };

  const getXPProgress = (xp) => {
    const currentLevelXP = (user.level - 1) * 500;
    const nextLevelXP = user.level * 500;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to take the next step in your career?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Level & XP Card */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm">Current Level</p>
              <p className="text-2xl font-bold">{user.level}</p>
            </div>
            <Trophy className="w-8 h-8 text-primary-100" />
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-primary-100 mb-1">
              <span>{user.xp} XP</span>
              <span>{user.level * 500} XP</span>
            </div>
            <div className="w-full bg-primary-700 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${getXPProgress(user.xp)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Applications Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userApplications.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary-500" />
          </div>
          <div className="flex space-x-2 text-xs">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{statusCounts.applied} Applied</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{statusCounts.selected} Selected</span>
          </div>
        </div>

        {/* Rank Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Campus Rank</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">#{user.rank}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-secondary-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.badges.length} badges earned
          </p>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link 
              to="/jobs"
              className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Jobs
            </Link>
            <Link 
              to="/post-job"
              className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Opportunity
            </Link>
          </div>
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Pending Review</span>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.applied}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Under Review</span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.reviewed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Selected</span>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.selected}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Not Selected</span>
              </div>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {statusCounts.rejected}
              </span>
            </div>
          </div>
          <Link 
            to="/applications"
            className="mt-4 block text-center bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            View All Applications
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Badges & Achievements</h3>
          {user.badges.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {user.badges.map((badge, index) => (
                <div key={index} className="flex items-center p-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    🏆
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{badge}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Achievement unlocked!</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No badges yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Start applying and posting to earn your first badge!</p>
            </div>
          )}
          <Link 
            to="/leaderboard"
            className="mt-4 block text-center border border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>

      {/* Recent Job Opportunities */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Opportunities</h3>
          <Link 
            to="/jobs"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentJobs.map(job => (
            <div key={job.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.company}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-1 rounded">
                  {job.type}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ₹{job.stipend.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <Link 
                to={`/jobs/${job.id}`}
                className="block text-center bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;