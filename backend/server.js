require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Configuration, OpenAIApi } = require('openai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }]
});

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    linkedin: String,
    github: String
  },
  summary: String,
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    location: String,
    year: String
  }],
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String]
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String
  }],
  jobDescription: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Resume = mongoose.model('Resume', ResumeSchema);

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Auth Middleware
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/generate-resume', authenticate, async (req, res) => {
  try {
    const { personalInfo, experience, education, skills, jobDescription } = req.body;
    
    const prompt = `Create a professional resume based on the following information:
    
    Personal Information: ${JSON.stringify(personalInfo)}
    Experience: ${JSON.stringify(experience)}
    Education: ${JSON.stringify(education)}
    Skills: ${JSON.stringify(skills)}
    
    The resume should be optimized for this job description: ${jobDescription}
    
    Format the resume with appropriate sections (Summary, Experience, Education, Skills) and use professional language with quantifiable achievements where possible.`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const resumeContent = response.data.choices[0].text;

    const resume = new Resume({
      userId: req.user._id,
      personalInfo,
      experience,
      education,
      skills,
      jobDescription,
      summary: resumeContent.match(/Summary:([\s\S]*?)(?=Experience:|$)/i)?.[1]?.trim(),
    });

    await resume.save();
    req.user.resumes.push(resume._id);
    await req.user.save();

    res.json({ resume: resumeContent, resumeId: resume._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating resume' });
  }
});

app.post('/api/generate-cover-letter', authenticate, async (req, res) => {
  try {
    const { resumeId, jobDescription, companyInfo } = req.body;
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const prompt = `Write a compelling cover letter for ${resume.personalInfo.name} applying to ${companyInfo.name} for a position described as:
    ${jobDescription}
    
    The candidate's relevant experience includes:
    ${resume.experience.map(exp => `${exp.title} at ${exp.company}: ${exp.description}`).join('\n')}
    
    Their education background:
    ${resume.education.map(edu => `${edu.degree} from ${edu.institution}`).join('\n')}
    
    Key skills: ${resume.skills.join(', ')}
    
    The cover letter should be professional, tailored to the job, and highlight relevant qualifications.`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.json({ coverLetter: response.data.choices[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating cover letter' });
  }
});

app.get('/api/resumes', authenticate, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort('-createdAt');
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));