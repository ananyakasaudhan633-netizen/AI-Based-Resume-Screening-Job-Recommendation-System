# AI-Based Resume Screening & Job Recommendation System

An AI-powered web application that analyzes resumes, extracts skills, evaluates candidate profiles, identifies skill gaps, and recommends suitable job opportunities.

This project is developed as a B.Tech final-year project using **React, Vite, Flask, Python, SQLite, and resume-processing technologies**.

## 🚀 Features

* 🔐 User Registration & Login
* 📄 Resume Upload
* 🤖 Automated Resume Analysis
* 📊 Resume Score & Analysis Result
* 🧠 Skill Extraction
* 💼 Recommended Jobs
* 📈 Skill Gap Analysis
* 👤 User Profile
* 📋 Dashboard with Resume & Job Insights
* 🔑 Session-based Authentication
* 🛠️ Admin Dashboard
* 🗄️ SQLite Database
* 📱 Responsive and Modern UI

## 🛠️ Technologies Used

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* Lucide React

### Backend

* Python
* Flask
* Flask-CORS
* SQLite
* PyPDF
* python-docx

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

## 📂 Project Structure

```text
AI-Based-Resume-Screening-Job-Recommendation-System/
│
├── ai-resume-analyzer-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app.py
│   └── ...
│
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ananyakasaudhan633-netizen/AI-Based-Resume-Screening-Job-Recommendation-System.git
```

```bash
cd AI-Based-Resume-Screening-Job-Recommendation-System
```

### 2. Frontend Setup

Open a terminal inside the frontend directory:

```bash
cd ai-resume-analyzer-frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend will normally run at:

```text
http://localhost:5173
```

### 3. Backend Setup

Open **another terminal** and go to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install flask flask-cors werkzeug pypdf python-docx
```

Start the Flask server:

```bash
python app.py
```

Backend will normally run at:

```text
http://localhost:5000
```

## 🔄 Application Workflow

```text
User Registration/Login
          ↓
      Dashboard
          ↓
    Upload Resume
          ↓
   Resume Processing
          ↓
    Resume Analysis
          ↓
   Skills Extraction
          ↓
   Skill Gap Analysis
          ↓
 Recommended Jobs
          ↓
    View Job Details
```

## 📄 Resume Analysis

The system processes uploaded resumes and extracts relevant information such as:

* Technical Skills
* Programming Languages
* Tools & Technologies
* Candidate Profile Information
* Relevant Job Skills

The extracted information is used to generate analysis results and job recommendations.

## 💼 Job Recommendation

The system compares the candidate's extracted skills with available job requirements and provides relevant job recommendations.

Example job categories include:

* Python Developer
* Frontend Developer
* Full Stack Developer
* Data Analyst
* Machine Learning Engineer
* AI/ML Intern
* Software Engineer
* React Developer

## 📊 Skill Gap Analysis

The Skill Gap Analysis feature helps users understand:

* Skills they already have
* Skills required for recommended roles
* Missing skills
* Areas that can be improved

## 🔐 Authentication

The application includes session-based authentication for protected features.

Users need to log in before accessing personalized resume analysis, skills, recommendations, and profile information.

## 🖥️ Running the Project Offline

The project can run locally without an internet connection after all required dependencies have been installed.

Required software:

* Node.js
* Python
* Required Python packages
* Required npm packages

Both the React frontend and Flask backend can run on the local machine.

## 🎯 Future Scope

* Advanced Machine Learning-based resume scoring
* NLP-based resume understanding
* More accurate job matching
* Real-time job APIs
* Job portal integration
* Resume improvement suggestions
* Interview preparation module
* Skill learning recommendations
* Cloud deployment
* Advanced admin analytics

## 👩‍💻 Developer

**Ananya Kasaudhan**

B.Tech – Information Technology

Gorakhpur, Uttar Pradesh, India

## 📌 Project Title

**AI-Based Resume Screening & Job Recommendation System**

---

⭐ If you find this project useful, consider giving the repository a star.
