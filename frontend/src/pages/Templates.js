import { useState } from 'react';
import { DocumentTextIcon, TemplateIcon, ArrowDownTrayIcon } from '@heroicons/react/outline';

const templates = [
  {
    id: 1,
    name: 'Professional',
    category: 'All Industries',
    description: 'Clean, modern design suitable for any professional role',
    preview: '/templates/professional.jpg'
  },
  {
    id: 2,
    name: 'Creative',
    category: 'Design/Art',
    description: 'Stylish layout perfect for creative professionals',
    preview: '/templates/creative.jpg'
  },
  {
    id: 3,
    name: 'Minimalist',
    category: 'Tech/Engineering',
    description: 'Simple and focused design that highlights your skills',
    preview: '/templates/minimalist.jpg'
  },
  {
    id: 4,
    name: 'Executive',
    category: 'Management',
    description: 'Elegant design for senior-level professionals',
    preview: '/templates/executive.jpg'
  },
  {
    id: 5,
    name: 'Academic',
    category: 'Education/Research',
    description: 'Formal structure ideal for academic applications',
    preview: '/templates/academic.jpg'
  },
  {
    id: 6,
    name: 'ATS-Friendly',
    category: 'All Industries',
    description: 'Optimized for applicant tracking systems',
    preview: '/templates/ats.jpg'
  },
];

const TemplateCard = ({ template }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 bg-gray-100">
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <TemplateIcon className="h-12 w-12 text-gray-400" />
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button className="px-4 py-2 bg-white text-primary-600 rounded-md flex items-center">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Use Template
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500">{template.category}</p>
        <p className="mt-2 text-sm text-gray-600">{template.description}</p>
      </div>
    </div>
  );
};

const Templates = () => {
  const [category, setCategory] = useState('All');

  const filteredTemplates = category === 'All' 
    ? templates 
    : templates.filter(t => t.category.includes(category));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Templates</h1>
          <p className="mt-2 text-gray-600">Choose from our professionally designed templates</p>
        </div>
        <div className="mt-4 md:mt-0">
          <label htmlFor="category" className="sr-only">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="All">All Categories</option>
            <option value="All Industries">All Industries</option>
            <option value="Design/Art">Design/Art</option>
            <option value="Tech/Engineering">Tech/Engineering</option>
            <option value="Management">Management</option>
            <option value="Education/Research">Education/Research</option>
          </select>