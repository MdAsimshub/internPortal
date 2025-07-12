import Header from './Header';
import BackendStatus from '../BackendStatus';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      {/* Backend Status Indicator */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <BackendStatus />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
};

export default Layout;