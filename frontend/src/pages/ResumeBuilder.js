import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DocumentTextIcon, UserIcon, BriefcaseIcon, AcademicCapIcon, CodeIcon, TrophyIcon } from '@heroicons/react/outline';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [resumes, setResumes] = useState([]);

  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: user?.email || '',
      phone: '',
      address: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [{
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    education: [{
      degree: '',
      institution: '',
      location: '',
      year: ''
    }],
    skills: [],
    projects: [{
      name: '',
      description: '',
      technologies: []
    }],
    certifications: [{
      name: '',
      issuer: '',
      date: ''
    }],
    jobDescription: ''
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get('/api/resumes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResumes(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResumes();
  }, []);

  const handleChange = (e, section, index) => {
    const { name, value } = e.target;
    if (section && index !== undefined) {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) => 
          i === index ? { ...item, [name]: value } : item
        )
      }));
    } else if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addItem = (section) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], getDefaultItem(section)]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const getDefaultItem = (section) => {
    switch (section) {
      case 'experience':
        return { title: '', company: '', location: '', startDate: '', endDate: '', description: '' };
      case 'education':
        return { degree: '', institution: '', location: '', year: '' };
      case 'projects':
        return { name: '', description: '', technologies: [] };
      case 'certifications':
        return { name: '', issuer: '', date: '' };
      default:
        return {};
    }
  };

  const handleSkillChange = (e) => {
    const { value } = e.target;
    if (e.key === 'Enter' && value.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, value.trim()]
      }));
      e.target.value = '';
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const generateResume = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/generate-resume', {
        ...formData,
        jobDescription: formData.jobDescription
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGeneratedResume(res.data.resume);
      setResumes(prev => [{ ...formData, _id: res.data.resumeId }, ...prev]);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert('Error generating resume');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedResume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.personalInfo.name.replace(' ', '_')}_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary-700 mb-6">Resume Builder</h1>
      
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${step === stepNum ? 'bg-primary-600 text-white' : 
                  step > stepNum ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-600'}`}
            >
              {stepNum}
            </div>
            <span className="text-sm mt-2 text-gray-600">
              {['Personal Info', 'Experience', 'Job Details', 'Result'][stepNum - 1]}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.personalInfo).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type={key === 'email' ? 'email' : 'text'}
                  name={key}
                  value={value}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Briefly describe your professional background and key skills..."
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Next: Experience
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Experience & Education */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-primary-600" />
            Work Experience
          </h2>
          {formData.experience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(exp).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    {key === 'description' ? (
                      <textarea
                        name={key}
                        value={value}
                        onChange={(e) => handleChange(e, 'experience', index)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <input
                        type={key.includes('Date') ? 'date' : 'text'}
                        name={key}
                        value={value}
                        onChange={(e) => handleChange(e, 'experience', index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => removeItem('experience', index)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove Experience
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem('experience')}
            className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + Add Another Experience
          </button>

          <h2 className="text-xl font-semibold mt-8 mb-6 flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-2 text-primary-600" />
            Education
          </h2>
          {formData.education.map((edu, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(edu).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type={key === 'year' ? 'text' : 'text'}
                      name={key}
                      value={value}
                      onChange={(e) => handleChange(e, 'education', index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => removeItem('education', index)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove Education
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem('education')}
            className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + Add Another Education
          </button>

          <h2 className="text-xl font-semibold mt-8 mb-6 flex items-center">
            <CodeIcon className="h-5 w-5 mr-2 text-primary-600" />
            Skills & Projects
          </h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (Press Enter to add)</label>
            <input
              type="text"
              onKeyDown={handleSkillChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type a skill and press Enter"
            />
            <div className="flex flex-wrap mt-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm mr-2 mb-2 flex items-center">
                  {skill}
                  <button 
                    onClick={() => removeSkill(index)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {formData.projects.map((project, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-3">Project {index + 1}</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(project).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    {key === 'description' ? (
                      <textarea
                        name={key}
                        value={value}
                        onChange={(e) => handleChange(e, 'projects', index)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : key === 'technologies' ? (
                      <input
                        type="text"
                        name={key}
                        value={value.join(', ')}
                        onChange={(e) => handleChange({
                          target: {
                            name: key,
                            value: e.target.value.split(',').map(item => item.trim())
                          }
                        }, 'projects', index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <input
                        type="text"
                        name={key}
                        value={value}
                        onChange={(e) => handleChange(e, 'projects', index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => removeItem('projects', index)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove Project
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem('projects')}
            className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + Add Project
          </button>

          <h2 className="text-xl font-semibold mt-8 mb-6 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-primary-600" />
            Certifications
          </h2>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(cert).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type={key === 'date' ? 'date' : 'text'}
                      name={key}
                      value={value}
                      onChange={(e) => handleChange(e, 'certifications', index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => removeItem('certifications', index)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove Certification
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem('certifications')}
            className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + Add Certification
          </button>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Next: Job Details
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Job Details */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Job Details</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste the Job Description You're Applying For
            </label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Copy and paste the job description here. Our AI will analyze it and optimize your resume accordingly."
            />
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back
            </button>
            <button
              onClick={generateResume}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Optimized Resume'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Generated Resume */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Your AI-Generated Resume</h2>
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="whitespace-pre-wrap font-mono text-sm">
              {generatedResume}
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back
            </button>
            <div className="space-x-3">
              <button
                onClick={downloadResume}
                className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                Download Resume
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;