import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-3xl mx-auto px-2">
        <div className="flex justify-between h-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <HomeIcon className="h-6 w-6 text-slate-600 hover:text-slate-900" />
            </Link>
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">N2K Logistics</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/track" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Track Package
            </Link>
            <Link to="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Admin Portal
            </Link>
            <Link to="/driver" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Driver Portal
            </Link>
            <Link to="/agent-signup" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Become an Agent
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;