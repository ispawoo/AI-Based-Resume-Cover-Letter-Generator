import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DocumentTextIcon, BuildingOfficeIcon } from '@heroicons/react/outline';

const CoverLetter = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [formData, setFormData] = useState({
    companyInfo: {
      name: '',
      address: '',
      hiringManager: '',
      position: ''
    },
    jobDescription: '',
    additionalNotes: ''
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get('/api/resumes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResumes(res.data);
        if (res.data.length > 0) {
          setSelectedResumeId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchResumes();
  }, []);

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateCoverLetter = async () => {
    if (!selectedResumeId) {
      alert('Please select a resume to use as your base');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/api/generate-cover-letter', {
        resumeId: selectedResumeId,
        jobDescription: formData.jobDescription,
        companyInfo: formData.companyInfo
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGeneratedLetter(res.data.coverLetter);
    } catch (err) {
      console.error(err);
      alert('Error generating cover letter');
    } finally {
      setLoading(false);
    }
  };

  const downloadCoverLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${formData.companyInfo.name.replace(' ', '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary-700 mb-6">Cover Letter Generator</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
          Select Your Resume
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose a resume to base your cover letter on:
          </label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {resumes.map(resume => (
              <option key={resume._id} value={resume._id}>
                {resume.personalInfo?.name || 'Untitled Resume'} - {new Date(resume.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
          Company Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(formData.companyInfo).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={(e) => handleChange(e, 'companyInfo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Paste the job description you're applying for..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Any specific points you want to emphasize in your cover letter..."
          />
        </div>

        <button
          onClick={generateCoverLetter}
          disabled={loading}
          className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Cover Letter'}
        </button>

        {generatedLetter && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your AI-Generated Cover Letter</h2>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
              <div className="whitespace-pre-wrap">{generatedLetter}</div>
            </div>
            <button
              onClick={downloadCoverLetter}
              className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              Download Cover Letter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetter;