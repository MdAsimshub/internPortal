import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockUsers, badgeDefinitions } from '../../data/mockData';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star,
  TrendingUp,
  Users,
  Target,
  Gift
} from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overall');

  const sortedUsers = mockUsers
    .filter(u => u.role === 'student')
    .sort((a, b) => b.xp - a.xp)
    .map((u, index) => ({ ...u, rank: index + 1 }));

  const topPerformers = sortedUsers.slice(0, 3);
  const otherUsers = sortedUsers.slice(3);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</div>;
    }
  };

  const getLevelColor = (level) => {
    if (level >= 8) return 'from-purple-500 to-pink-500';
    if (level >= 6) return 'from-blue-500 to-purple-500';
    if (level >= 4) return 'from-green-500 to-blue-500';
    return 'from-yellow-500 to-green-500';
  };

  const getXPProgress = (xp, level) => {
    const currentLevelXP = (level - 1) * 500;
    const nextLevelXP = level * 500;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Campus Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how you stack up against fellow students
        </p>
      </div>

      {/* User's Current Position */}
      {user && user.role === 'student' && (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
              <div>
                <h3 className="text-lg font-semibold">Your Position</h3>
                <p className="text-primary-100">
                  Rank #{user.rank} • Level {user.level} • {user.xp} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">#{user.rank}</div>
              <div className="text-sm text-primary-100">{user.badges.length} badges</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sortedUsers.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Level</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(sortedUsers.reduce((acc, u) => acc + u.level, 0) / sortedUsers.length)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-secondary-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total XP</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sortedUsers.reduce((acc, u) => acc + u.xp, 0).toLocaleString()}
              </p>
            </div>
            <Star className="w-8 h-8 text-accent-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Badges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sortedUsers.reduce((acc, u) => acc + u.badges.length, 0)}
              </p>
            </div>
            <Gift className="w-8 h-8 text-warning-500" />
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Top Performers
        </h2>
        <div className="flex justify-center items-end space-x-4">
          {topPerformers.map((student, index) => (
            <div
              key={student.id}
              className={`flex flex-col items-center ${
                index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'
              }`}
            >
              {/* Podium */}
              <div
                className={`w-24 bg-gradient-to-t ${
                  index === 0 
                    ? 'from-yellow-400 to-yellow-300 h-24' 
                    : index === 1 
                      ? 'from-gray-400 to-gray-300 h-20' 
                      : 'from-amber-600 to-amber-500 h-16'
                } rounded-t-lg flex items-center justify-center mb-4`}
              >
                <span className="text-white font-bold text-lg">#{student.rank}</span>
              </div>

              {/* Student Info */}
              <div className="text-center">
                <img 
                  src={student.avatar} 
                  alt={student.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-4 border-white shadow-lg"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{student.university}</p>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getLevelColor(student.level)}`}>
                    Level {student.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {student.xp} XP
                </p>
                <div className="flex justify-center space-x-1 mt-2">
                  {student.badges.slice(0, 3).map((badge, badgeIndex) => (
                    <span
                      key={badgeIndex}
                      className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs"
                      title={badge}
                    >
                      🏆
                    </span>
                  ))}
                  {student.badges.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{student.badges.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Full Rankings
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedUsers.map((student, index) => (
            <div
              key={student.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                user && student.id === user.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(student.rank)}
                  </div>
                  
                  <img 
                    src={student.avatar} 
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      {student.name}
                      {user && student.id === user.id && (
                        <span className="ml-2 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-1 rounded-full text-xs">
                          You
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.university}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 w-48">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Level {student.level}</span>
                        <span>{student.xp} XP</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getLevelColor(student.level)} transition-all duration-300`}
                          style={{ width: `${getXPProgress(student.xp, student.level)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">{student.applications}</div>
                    <div>Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">{student.posts}</div>
                    <div>Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">{student.referrals}</div>
                    <div>Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">{student.badges.length}</div>
                    <div>Badges</div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {student.badges.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {student.badges.map((badge, badgeIndex) => (
                    <span
                      key={badgeIndex}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        badgeDefinitions[badge]?.color || 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      <span className="mr-1">{badgeDefinitions[badge]?.icon}</span>
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badge Information */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Badges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(badgeDefinitions).map(([name, info]) => (
            <div key={name} className={`p-4 rounded-lg border ${info.color}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{info.icon}</span>
                <span className="font-medium">{name}</span>
              </div>
              <p className="text-sm">{info.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;