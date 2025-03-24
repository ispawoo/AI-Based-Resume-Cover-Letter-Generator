import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DocumentTextIcon, ArrowUpRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get('/api/resumes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResumes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email}</h1>
        <Link
          to="/resume-builder"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Create New Resume
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <div key={resume._id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {resume.personalInfo?.name || 'Untitled Resume'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {resume.experience[0]?.title || 'No position specified'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 line-clamp-2">
                  {resume.summary || 'No summary available'}
                </p>
              </div>
              <div className="mt-5">
                <Link
                  to={`/resume-builder?resumeId=${resume._id}`}
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Edit resume <ArrowUpRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {resumes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new resume.</p>
            <div className="mt-6">
              <Link
                to="/resume-builder"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;