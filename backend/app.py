import os
import re
import sqlite3
from functools import wraps
from datetime import datetime

from flask import (
    Flask,
    request,
    jsonify,
    session,
    send_from_directory,
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pypdf import PdfReader
from docx import Document


# =========================================================
# APP CONFIGURATION
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "resume_analyzer.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)

app.secret_key = "ai-resume-analyzer-local-development-key"

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
)


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc"}


# =========================================================
# DATABASE
# =========================================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            phone TEXT DEFAULT '',
            location TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            extracted_text TEXT DEFAULT '',
            uploaded_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            resume_id INTEGER NOT NULL,
            role TEXT DEFAULT '',
            score REAL DEFAULT 0,
            skills TEXT DEFAULT '',
            missing_skills TEXT DEFAULT '',
            strengths TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(resume_id) REFERENCES resumes(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT DEFAULT 'Remote',
            skills TEXT DEFAULT '',
            description TEXT DEFAULT '',
            category TEXT DEFAULT 'Technology'
        )
    """)

    conn.commit()

    # -----------------------------------------------------
    # Create demo/admin user
    # -----------------------------------------------------

    admin = cursor.execute(
        "SELECT id FROM users WHERE email = ?",
        ("admin@example.com",)
    ).fetchone()

    if not admin:
        cursor.execute("""
            INSERT INTO users
            (name, email, password, role, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            "Admin",
            "admin@example.com",
            generate_password_hash("Admin@123"),
            "admin",
            datetime.now().isoformat()
        ))

    # -----------------------------------------------------
    # Seed jobs
    # -----------------------------------------------------

    job_count = cursor.execute(
        "SELECT COUNT(*) AS count FROM jobs"
    ).fetchone()["count"]

    if job_count == 0:
        jobs = [
            (
                "Python Developer",
                "Tech Solutions",
                "Remote",
                "Python, Flask, SQL, Git",
                "Develop backend applications using Python and Flask.",
                "Backend"
            ),
            (
                "Frontend Developer",
                "WebWorks",
                "Bangalore",
                "JavaScript, React, HTML, CSS",
                "Build responsive web applications using React.",
                "Frontend"
            ),
            (
                "Full Stack Developer",
                "Innovate Labs",
                "Hyderabad",
                "Python, React, SQL, JavaScript",
                "Work on frontend and backend web applications.",
                "Full Stack"
            ),
            (
                "Data Analyst",
                "Data Insights",
                "Pune",
                "Python, Pandas, SQL, Excel",
                "Analyze data and create meaningful business insights.",
                "Data"
            ),
            (
                "Machine Learning Engineer",
                "AI Technologies",
                "Bangalore",
                "Python, Machine Learning, Pandas, NumPy",
                "Develop and deploy machine learning solutions.",
                "AI/ML"
            ),
            (
                "AI/ML Intern",
                "Future AI Labs",
                "Remote",
                "Python, Machine Learning, Pandas",
                "Assist with AI and machine learning projects.",
                "AI/ML"
            ),
            (
                "Software Engineer",
                "Digital Systems",
                "Noida",
                "Python, C++, SQL, Git",
                "Develop and maintain software applications.",
                "Software"
            ),
            (
                "React Developer",
                "AppCraft",
                "Delhi",
                "React, JavaScript, HTML, CSS",
                "Create modern user interfaces with React.",
                "Frontend"
            ),
        ]

        cursor.executemany("""
            INSERT INTO jobs
            (title, company, location, skills, description, category)
            VALUES (?, ?, ?, ?, ?, ?)
        """, jobs)

    conn.commit()
    conn.close()


# =========================================================
# HELPERS
# =========================================================

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return None

    conn = get_db()

    user = conn.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()

    conn.close()

    return user


def login_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({
                "success": False,
                "message": "Please login first."
            }), 401

        return function(*args, **kwargs)

    return wrapper


def admin_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        user = current_user()

        if not user or user["role"] != "admin":
            return jsonify({
                "success": False,
                "message": "Admin access required."
            }), 403

        return function(*args, **kwargs)

    return wrapper


def row_to_dict(row):
    return dict(row) if row else None


# =========================================================
# RESUME TEXT EXTRACTION
# =========================================================

def extract_pdf_text(path):
    text = ""

    reader = PdfReader(path)

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def extract_docx_text(path):
    document = Document(path)

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    return "\n".join(paragraphs)


def extract_resume_text(path):
    extension = path.rsplit(".", 1)[1].lower()

    if extension == "pdf":
        return extract_pdf_text(path)

    if extension in {"docx", "doc"}:
        return extract_docx_text(path)

    return ""


# =========================================================
# SKILL ANALYSIS
# =========================================================

SKILLS = {
    "Python": [
        "python"
    ],
    "Java": [
        "java"
    ],
    "C++": [
        "c++",
        "cpp"
    ],
    "JavaScript": [
        "javascript",
        "js"
    ],
    "React": [
        "react",
        "reactjs"
    ],
    "Node.js": [
        "node.js",
        "nodejs",
        "node js"
    ],
    "HTML": [
        "html"
    ],
    "CSS": [
        "css"
    ],
    "SQL": [
        "sql",
        "mysql",
        "postgresql",
        "postgres"
    ],
    "Flask": [
        "flask"
    ],
    "Django": [
        "django"
    ],
    "Machine Learning": [
        "machine learning",
        "machine-learning"
    ],
    "Deep Learning": [
        "deep learning",
        "deep-learning"
    ],
    "Artificial Intelligence": [
        "artificial intelligence",
        "artificial intelligence"
    ],
    "Pandas": [
        "pandas"
    ],
    "NumPy": [
        "numpy"
    ],
    "TensorFlow": [
        "tensorflow"
    ],
    "PyTorch": [
        "pytorch"
    ],
    "Git": [
        "git",
        "github"
    ],
    "Excel": [
        "excel",
        "microsoft excel"
    ],
    "Data Analysis": [
        "data analysis",
        "data analytics"
    ],
    "Data Science": [
        "data science"
    ],
    "REST API": [
        "rest api",
        "restful api",
        "api development"
    ],
}


def extract_skills(text):
    text_lower = text.lower()

    found = []

    for skill, keywords in SKILLS.items():
        for keyword in keywords:
            keyword_lower = keyword.lower()

            if keyword_lower in text_lower:
                found.append(skill)
                break

    return found
def infer_role(skills, text):
    text_lower = text.lower()

    if (
        "machine learning" in text_lower
        or "deep learning" in text_lower
        or "artificial intelligence" in text_lower
    ):
        return "AI / ML Engineer"

    if "react" in text_lower or "frontend" in text_lower:
        return "Frontend Developer"

    if (
        "flask" in text_lower
        or "django" in text_lower
        or "backend" in text_lower
    ):
        return "Backend Developer"

    if "data analyst" in text_lower or "data analysis" in text_lower:
        return "Data Analyst"

    if "full stack" in text_lower:
        return "Full Stack Developer"

    if "python" in [skill.lower() for skill in skills]:
        return "Python Developer"

    return "Software Engineer"


def calculate_score(skills):
    max_score = 100

    if not skills:
        return 35

    score = min(95, 35 + len(skills) * 6)

    return score


def generate_strengths(skills):
    if not skills:
        return [
            "Resume uploaded successfully",
            "Add technical skills to improve your profile"
        ]

    strengths = []

    if "Python" in skills:
        strengths.append("Python programming")

    if "Machine Learning" in skills:
        strengths.append("Machine Learning knowledge")

    if "React" in skills:
        strengths.append("Frontend development")

    if "SQL" in skills:
        strengths.append("Database and SQL knowledge")

    if "Git" in skills:
        strengths.append("Version control knowledge")

    if not strengths:
        strengths = [
            f"{len(skills)} technical skills detected"
        ]

    return strengths


# =========================================================
# HEALTH
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "AI Resume Analyzer Backend is running.",
        "database": os.path.exists(DATABASE)
    })


# =========================================================
# AUTHENTICATION
# =========================================================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email and password are required."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 6 characters."
        }), 400

    conn = get_db()

    existing = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing:
        conn.close()

        return jsonify({
            "success": False,
            "message": "Email already registered."
        }), 409

    cursor = conn.execute("""
        INSERT INTO users
        (name, email, password, role, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        name,
        email,
        generate_password_hash(password),
        "user",
        datetime.now().isoformat()
    ))

    user_id = cursor.lastrowid

    conn.commit()
    conn.close()

    session["user_id"] = user_id

    return jsonify({
        "success": True,
        "message": "Registration successful.",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": "user"
        }
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    conn = get_db()

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    session["user_id"] = user["id"]

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "phone": user["phone"],
            "location": user["location"],
            "bio": user["bio"]
        }
    })


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    })


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    user = current_user()

    if not user:
        return jsonify({
            "success": False,
            "authenticated": False
        }), 401

    return jsonify({
        "success": True,
        "authenticated": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "phone": user["phone"],
            "location": user["location"],
            "bio": user["bio"]
        }
    })


# =========================================================
# PROFILE
# =========================================================

@app.route("/api/profile", methods=["GET"])
@login_required
def get_profile():
    user = current_user()

    return jsonify({
        "success": True,
        "profile": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "location": user["location"],
            "bio": user["bio"],
            "role": user["role"]
        }
    })


@app.route("/api/profile", methods=["PUT"])
@login_required
def update_profile():
    user = current_user()
    data = request.get_json() or {}

    name = data.get("name", user["name"]).strip()
    phone = data.get("phone", user["phone"]).strip()
    location = data.get("location", user["location"]).strip()
    bio = data.get("bio", user["bio"]).strip()

    conn = get_db()

    conn.execute("""
        UPDATE users
        SET name = ?, phone = ?, location = ?, bio = ?
        WHERE id = ?
    """, (
        name,
        phone,
        location,
        bio,
        user["id"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Profile updated successfully."
    })


# =========================================================
# RESUME UPLOAD
# =========================================================

@app.route("/api/resume/upload", methods=["POST"])
@login_required
def upload_resume():
    if "resume" not in request.files:
        return jsonify({
            "success": False,
            "message": "Please select a resume file."
        }), 400

    file = request.files["resume"]

    if not file or not file.filename:
        return jsonify({
            "success": False,
            "message": "No resume selected."
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "message": "Only PDF, DOCX and DOC files are allowed."
        }), 400

    user = current_user()

    filename = secure_filename(file.filename)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    filename = f"{user['id']}_{timestamp}_{filename}"

    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    file.save(filepath)

    try:
        extracted_text = extract_resume_text(filepath)
    except Exception as error:
        if os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({
            "success": False,
            "message": f"Could not read resume: {str(error)}"
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO resumes
        (user_id, filename, file_path, extracted_text, uploaded_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        user["id"],
        filename,
        filepath,
        extracted_text,
        datetime.now().isoformat()
    ))

    resume_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Resume uploaded successfully.",
        "resume": {
            "id": resume_id,
            "filename": filename,
            "text_length": len(extracted_text)
        }
    }), 201


# =========================================================
# RESUME LATEST
# =========================================================

@app.route("/api/resume/latest", methods=["GET"])
@login_required
def latest_resume():
    user = current_user()

    conn = get_db()

    resume = conn.execute("""
        SELECT *
        FROM resumes
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (user["id"],)).fetchone()

    conn.close()

    if not resume:
        return jsonify({
            "success": False,
            "message": "No resume found."
        }), 404

    return jsonify({
        "success": True,
        "resume": {
            "id": resume["id"],
            "filename": resume["filename"],
            "uploaded_at": resume["uploaded_at"],
            "text_length": len(resume["extracted_text"] or "")
        }
    })


# =========================================================
# RESUME ANALYSIS
# =========================================================

@app.route("/api/analyze", methods=["POST"])
@login_required
def analyze_resume():
    user = current_user()

    conn = get_db()

    resume = conn.execute("""
        SELECT *
        FROM resumes
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (user["id"],)).fetchone()

    if not resume:
        conn.close()

        return jsonify({
            "success": False,
            "message": "Please upload a resume first."
        }), 404

    text = resume["extracted_text"] or ""

    skills = extract_skills(text)
    print("\n========== RESUME DEBUG ==========")
    print("Text length:", len(text))
    print("Detected skills:", skills)
    print("Pandas present:", "pandas" in text.lower())
    print("NumPy present:", "numpy" in text.lower())
    print("Deep Learning present:", "deep learning" in text.lower())
    print("==================================\n")
    role = infer_role(skills, text)

    score = calculate_score(skills)

    strengths = generate_strengths(skills)

    role_skill_map = {
        "AI / ML Engineer": [
            "Python",
            "Machine Learning",
            "Pandas",
            "NumPy",
            "Deep Learning"
        ],
        "Frontend Developer": [
            "HTML",
            "CSS",
            "JavaScript",
            "React"
        ],
        "Backend Developer": [
            "Python",
            "Flask",
            "SQL",
            "REST API"
        ],
        "Data Analyst": [
            "Python",
            "Pandas",
            "SQL",
            "Excel",
            "Data Analysis"
        ],
        "Full Stack Developer": [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Python",
            "SQL"
        ],
        "Python Developer": [
            "Python",
            "SQL",
            "Git",
            "REST API"
        ],
        "Software Engineer": [
            "Python",
            "Java",
            "C++",
            "SQL",
            "Git"
        ]
    }

    required_skills = role_skill_map.get(
        role,
        role_skill_map["Software Engineer"]
    )

    skill_lookup = {
    skill.strip().lower()
    for skill in skills
}

    missing_skills = [
    skill
    for skill in required_skills
    if skill.strip().lower() not in skill_lookup
]

    skills_text = ", ".join(skills)
    missing_text = ", ".join(missing_skills)
    strengths_text = ", ".join(strengths)

    existing = conn.execute("""
        SELECT id
        FROM analyses
        WHERE user_id = ? AND resume_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (
        user["id"],
        resume["id"]
    )).fetchone()

    if existing:
        conn.execute("""
            UPDATE analyses
            SET role = ?,
                score = ?,
                skills = ?,
                missing_skills = ?,
                strengths = ?,
                created_at = ?
            WHERE id = ?
        """, (
            role,
            score,
            skills_text,
            missing_text,
            strengths_text,
            datetime.now().isoformat(),
            existing["id"]
        ))

        analysis_id = existing["id"]

    else:
        cursor = conn.execute("""
            INSERT INTO analyses
            (user_id, resume_id, role, score, skills,
             missing_skills, strengths, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user["id"],
            resume["id"],
            role,
            score,
            skills_text,
            missing_text,
            strengths_text,
            datetime.now().isoformat()
        ))

        analysis_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "analysis": {
            "id": analysis_id,
            "resume_id": resume["id"],
            "role": role,
            "score": score,
            "skills": skills,
            "missingSkills": missing_skills,
            "strengths": strengths
        }
    })


# =========================================================
# GET LATEST ANALYSIS
# =========================================================

@app.route("/api/analysis/latest", methods=["GET"])
@login_required
def latest_analysis():
    user = current_user()

    conn = get_db()

    analysis = conn.execute("""
        SELECT *
        FROM analyses
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (user["id"],)).fetchone()

    conn.close()

    if not analysis:
        return jsonify({
            "success": False,
            "message": "No analysis available."
        }), 404

    skills = [
        item.strip()
        for item in (analysis["skills"] or "").split(",")
        if item.strip()
    ]

    missing = [
        item.strip()
        for item in (analysis["missing_skills"] or "").split(",")
        if item.strip()
    ]

    strengths = [
        item.strip()
        for item in (analysis["strengths"] or "").split(",")
        if item.strip()
    ]

    return jsonify({
        "success": True,
        "analysis": {
            "id": analysis["id"],
            "resume_id": analysis["resume_id"],
            "role": analysis["role"],
            "score": analysis["score"],
            "skills": skills,
            "missingSkills": missing,
            "strengths": strengths,
            "created_at": analysis["created_at"]
        }
    })


# =========================================================
# RECOMMENDED JOBS
# =========================================================

@app.route("/api/jobs/recommended", methods=["GET"])
@login_required
def recommended_jobs():
    user = current_user()

    conn = get_db()

    analysis = conn.execute("""
        SELECT *
        FROM analyses
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (user["id"],)).fetchone()

    jobs = conn.execute(
        "SELECT * FROM jobs ORDER BY id DESC"
    ).fetchall()

    conn.close()

    user_skills = []

    if analysis:
        user_skills = [
            item.strip().lower()
            for item in (analysis["skills"] or "").split(",")
            if item.strip()
        ]

    result = []

    for job in jobs:
        job_skills = [
            item.strip()
            for item in job["skills"].split(",")
            if item.strip()
        ]

        matching = [
            skill
            for skill in job_skills
            if skill.lower() in user_skills
        ]

        match_percentage = 0

        if job_skills:
            match_percentage = round(
                (len(matching) / len(job_skills)) * 100
            )

        result.append({
            "id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "skills": job_skills,
            "description": job["description"],
            "category": job["category"],
            "match": match_percentage
        })

    result.sort(
        key=lambda item: item["match"],
        reverse=True
    )

    return jsonify({
        "success": True,
        "jobs": result
    })


# =========================================================
# SKILL GAP
# =========================================================

@app.route("/api/skills/gap", methods=["GET"])
@login_required
def skill_gap():
    user = current_user()

    conn = get_db()

    analysis = conn.execute("""
        SELECT *
        FROM analyses
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (user["id"],)).fetchone()

    conn.close()

    if not analysis:
        return jsonify({
            "success": True,
            "skills": [],
            "missingSkills": []
        })

    skills = [
        item.strip()
        for item in (analysis["skills"] or "").split(",")
        if item.strip()
    ]

    missing = [
        item.strip()
        for item in (analysis["missing_skills"] or "").split(",")
        if item.strip()
    ]

    return jsonify({
        "success": True,
        "skills": skills,
        "missingSkills": missing
    })


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/api/dashboard", methods=["GET"])
@login_required
def dashboard():
    user = current_user()

    conn = get_db()

    resume_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM resumes
        WHERE user_id = ?
    """, (user["id"],)).fetchone()["count"]

    analysis_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM analyses
        WHERE user_id = ?
    """, (user["id"],)).fetchone()["count"]

    latest = conn.execute("""
        SELECT *
        FROM analyses
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (user["id"],)).fetchone()

    conn.close()

    score = latest["score"] if latest else 0
    role = latest["role"] if latest else "Not analyzed yet"

    skills = []

    if latest:
        skills = [
            item.strip()
            for item in (latest["skills"] or "").split(",")
            if item.strip()
        ]

    return jsonify({
        "success": True,
        "dashboard": {
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            },
            "resumeCount": resume_count,
            "analysisCount": analysis_count,
            "resumeScore": score,
            "recommendedRole": role,
            "skillsCount": len(skills)
        }
    })


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    conn = get_db()

    users = conn.execute(
        "SELECT COUNT(*) AS count FROM users"
    ).fetchone()["count"]

    resumes = conn.execute(
        "SELECT COUNT(*) AS count FROM resumes"
    ).fetchone()["count"]

    analyses = conn.execute(
        "SELECT COUNT(*) AS count FROM analyses"
    ).fetchone()["count"]

    jobs = conn.execute(
        "SELECT COUNT(*) AS count FROM jobs"
    ).fetchone()["count"]

    conn.close()

    return jsonify({
        "success": True,
        "stats": {
            "users": users,
            "resumes": resumes,
            "analyses": analyses,
            "jobs": jobs
        }
    })


# =========================================================
# ADMIN USERS
# =========================================================

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_users():
    conn = get_db()

    users = conn.execute("""
        SELECT
            id,
            name,
            email,
            role,
            phone,
            location,
            created_at
        FROM users
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    return jsonify({
        "success": True,
        "users": [dict(user) for user in users]
    })


# =========================================================
# ADMIN JOBS
# =========================================================

@app.route("/api/admin/jobs", methods=["GET"])
@admin_required
def admin_jobs():
    conn = get_db()

    jobs = conn.execute(
        "SELECT * FROM jobs ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify({
        "success": True,
        "jobs": [dict(job) for job in jobs]
    })


@app.route("/api/admin/jobs", methods=["POST"])
@admin_required
def create_job():
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    company = data.get("company", "").strip()
    location = data.get("location", "Remote").strip()
    skills = data.get("skills", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "Technology").strip()

    if not title or not company:
        return jsonify({
            "success": False,
            "message": "Title and company are required."
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO jobs
        (title, company, location, skills, description, category)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        title,
        company,
        location,
        skills,
        description,
        category
    ))

    job_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Job created successfully.",
        "job_id": job_id
    }), 201


# =========================================================
# ADMIN DELETE JOB
# =========================================================

@app.route("/api/admin/jobs/<int:job_id>", methods=["DELETE"])
@admin_required
def delete_job(job_id):
    conn = get_db()

    result = conn.execute(
        "DELETE FROM jobs WHERE id = ?",
        (job_id,)
    )

    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({
            "success": False,
            "message": "Job not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Job deleted successfully."
    })


# =========================================================
# SERVE UPLOADED RESUME
# =========================================================

@app.route("/api/uploads/<filename>", methods=["GET"])
@login_required
def uploaded_file(filename):
    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "success": False,
        "message": "File is too large. Maximum size is 10 MB."
    }), 413


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "API endpoint not found."
    }), 404


# =========================================================
# START APPLICATION
# =========================================================

if __name__ == "__main__":
    init_db()

    print("=" * 60)
    print("AI Resume Analyzer Backend")
    print("=" * 60)
    print("Backend URL: http://127.0.0.1:5000")
    print("Health URL : http://127.0.0.1:5000/api/health")
    print("Admin Email: admin@example.com")
    print("Admin Password: Admin@123")
    print("=" * 60)

    app.run(
    host="0.0.0.0",
    port=5000,
    debug=True
)