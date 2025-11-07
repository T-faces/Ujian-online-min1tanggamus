from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ Models ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: Literal["admin", "student"]
    class_name: Optional[str] = None  # For students
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["admin", "student"]
    class_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Subject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    question_text: str
    question_type: Literal["multiple_choice", "essay"]
    options: Optional[List[str]] = None  # For multiple choice
    correct_answer: Optional[str] = None  # For multiple choice (index) or essay
    points: int = 10
    order: int = 0

class QuestionCreate(BaseModel):
    question_text: str
    question_type: Literal["multiple_choice", "essay"]
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    points: int = 10
    order: int = 0

class Exam(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subject_id: str
    subject_name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: int = 60
    total_points: int = 100
    class_name: Optional[str] = None  # Target class
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExamCreate(BaseModel):
    title: str
    subject_id: str
    description: Optional[str] = None
    duration_minutes: int = 60
    class_name: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class Answer(BaseModel):
    question_id: str
    answer_text: str

class StudentExam(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    student_id: str
    student_name: str
    exam_title: str
    subject_name: str
    answers: List[Answer] = []
    score: Optional[float] = None
    total_points: int = 100
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    submitted_at: Optional[datetime] = None
    status: Literal["in_progress", "submitted", "graded"] = "in_progress"

class ExamSubmission(BaseModel):
    answers: List[Answer]

# ============ Auth Helper Functions ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============ Auth Routes ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump(exclude={'password'})
    user = User(**user_dict)
    
    doc = user.model_dump()
    doc['password_hash'] = hash_password(user_data.password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.email, user.role)
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc['id'], user_doc['email'], user_doc['role'])
    user_doc.pop('password_hash')
    user_doc.pop('_id', None)
    
    return {"token": token, "user": user_doc}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc

# ============ Subject Routes ============

@api_router.post("/subjects", response_model=Subject)
async def create_subject(subject_data: SubjectCreate, current_user: dict = Depends(get_admin_user)):
    subject = Subject(**subject_data.model_dump())
    doc = subject.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.subjects.insert_one(doc)
    return subject

@api_router.get("/subjects", response_model=List[Subject])
async def get_subjects(current_user: dict = Depends(get_current_user)):
    subjects = await db.subjects.find({}, {"_id": 0}).to_list(1000)
    for s in subjects:
        if isinstance(s.get('created_at'), str):
            s['created_at'] = datetime.fromisoformat(s['created_at'])
    return subjects

@api_router.delete("/subjects/{subject_id}")
async def delete_subject(subject_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.subjects.delete_one({"id": subject_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted"}

# ============ Exam Routes ============

@api_router.post("/exams", response_model=Exam)
async def create_exam(exam_data: ExamCreate, current_user: dict = Depends(get_admin_user)):
    # Get subject name
    subject = await db.subjects.find_one({"id": exam_data.subject_id})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    exam_dict = exam_data.model_dump()
    exam_dict['created_by'] = current_user['user_id']
    exam_dict['subject_name'] = subject['name']
    exam = Exam(**exam_dict)
    
    doc = exam.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('start_time'):
        doc['start_time'] = doc['start_time'].isoformat()
    if doc.get('end_time'):
        doc['end_time'] = doc['end_time'].isoformat()
    
    await db.exams.insert_one(doc)
    return exam

@api_router.get("/exams", response_model=List[Exam])
async def get_exams(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'admin':
        exams = await db.exams.find({}, {"_id": 0}).to_list(1000)
    else:
        # Students only see available exams
        user = await db.users.find_one({"id": current_user['user_id']})
        now = datetime.now(timezone.utc).isoformat()
        exams = await db.exams.find({
            "$or": [
                {"class_name": user.get('class_name')},
                {"class_name": None}
            ],
            "$or": [
                {"end_time": None},
                {"end_time": {"$gte": now}}
            ]
        }, {"_id": 0}).to_list(1000)
    
    for e in exams:
        if isinstance(e.get('created_at'), str):
            e['created_at'] = datetime.fromisoformat(e['created_at'])
        if isinstance(e.get('start_time'), str):
            e['start_time'] = datetime.fromisoformat(e['start_time'])
        if isinstance(e.get('end_time'), str):
            e['end_time'] = datetime.fromisoformat(e['end_time'])
    return exams

@api_router.get("/exams/history", response_model=List[StudentExam])
async def get_exam_history(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'student':
        query = {"student_id": current_user['user_id']}
    else:
        query = {}
    
    exams = await db.student_exams.find(query, {"_id": 0}).sort("started_at", -1).to_list(1000)
    
    for e in exams:
        if isinstance(e.get('started_at'), str):
            e['started_at'] = datetime.fromisoformat(e['started_at'])
        if isinstance(e.get('submitted_at'), str):
            e['submitted_at'] = datetime.fromisoformat(e['submitted_at'])
    
    return exams

@api_router.get("/exams/{exam_id}", response_model=Exam)
async def get_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if isinstance(exam.get('created_at'), str):
        exam['created_at'] = datetime.fromisoformat(exam['created_at'])
    if isinstance(exam.get('start_time'), str):
        exam['start_time'] = datetime.fromisoformat(exam['start_time'])
    if isinstance(exam.get('end_time'), str):
        exam['end_time'] = datetime.fromisoformat(exam['end_time'])
    return exam

@api_router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str, current_user: dict = Depends(get_admin_user)):
    # Delete exam and its questions
    await db.questions.delete_many({"exam_id": exam_id})
    result = await db.exams.delete_one({"id": exam_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam deleted"}

# ============ Question Routes ============

@api_router.post("/exams/{exam_id}/questions", response_model=Question)
async def create_question(exam_id: str, question_data: QuestionCreate, current_user: dict = Depends(get_admin_user)):
    # Verify exam exists
    exam = await db.exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    question_dict = question_data.model_dump()
    question_dict['exam_id'] = exam_id
    question = Question(**question_dict)
    
    await db.questions.insert_one(question.model_dump())
    return question

@api_router.get("/exams/{exam_id}/questions", response_model=List[Question])
async def get_questions(exam_id: str, current_user: dict = Depends(get_current_user)):
    questions = await db.questions.find({"exam_id": exam_id}, {"_id": 0}).sort("order", 1).to_list(1000)
    
    # Hide correct answers for students
    if current_user['role'] == 'student':
        for q in questions:
            q.pop('correct_answer', None)
    
    return questions

@api_router.delete("/questions/{question_id}")
async def delete_question(question_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.questions.delete_one({"id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted"}

# ============ Student Exam Routes ============

@api_router.post("/exams/{exam_id}/start")
async def start_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can take exams")
    
    # Check if already started
    existing = await db.student_exams.find_one({
        "exam_id": exam_id,
        "student_id": current_user['user_id'],
        "status": {"$in": ["in_progress", "submitted", "graded"]}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Exam already started or completed")
    
    # Get exam details
    exam = await db.exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    user = await db.users.find_one({"id": current_user['user_id']})
    
    student_exam = StudentExam(
        exam_id=exam_id,
        student_id=current_user['user_id'],
        student_name=user['name'],
        exam_title=exam['title'],
        subject_name=exam['subject_name'],
        total_points=exam['total_points']
    )
    
    doc = student_exam.model_dump()
    doc['started_at'] = doc['started_at'].isoformat()
    
    await db.student_exams.insert_one(doc)
    return student_exam

@api_router.post("/exams/{exam_id}/submit")
async def submit_exam(exam_id: str, submission: ExamSubmission, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can submit exams")
    
    # Get student exam
    student_exam = await db.student_exams.find_one({
        "exam_id": exam_id,
        "student_id": current_user['user_id'],
        "status": "in_progress"
    })
    
    if not student_exam:
        raise HTTPException(status_code=404, detail="Exam not started or already submitted")
    
    # Get questions with correct answers
    questions = await db.questions.find({"exam_id": exam_id}, {"_id": 0}).to_list(1000)
    questions_dict = {q['id']: q for q in questions}
    
    # Calculate score
    total_score = 0
    for answer in submission.answers:
        question = questions_dict.get(answer.question_id)
        if question and question['question_type'] == 'multiple_choice':
            if answer.answer_text == question.get('correct_answer'):
                total_score += question['points']
    
    # Update student exam
    now = datetime.now(timezone.utc).isoformat()
    await db.student_exams.update_one(
        {"id": student_exam['id']},
        {"$set": {
            "answers": [a.model_dump() for a in submission.answers],
            "score": total_score,
            "submitted_at": now,
            "status": "graded"
        }}
    )
    
    return {"score": total_score, "total_points": student_exam['total_points']}

@api_router.get("/exams/history", response_model=List[StudentExam])
async def get_exam_history(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'student':
        query = {"student_id": current_user['user_id']}
    else:
        query = {}
    
    exams = await db.student_exams.find(query, {"_id": 0}).sort("started_at", -1).to_list(1000)
    
    for e in exams:
        if isinstance(e.get('started_at'), str):
            e['started_at'] = datetime.fromisoformat(e['started_at'])
        if isinstance(e.get('submitted_at'), str):
            e['submitted_at'] = datetime.fromisoformat(e['submitted_at'])
    
    return exams

@api_router.get("/exams/{exam_id}/results")
async def get_exam_results(exam_id: str, current_user: dict = Depends(get_admin_user)):
    results = await db.student_exams.find({"exam_id": exam_id}, {"_id": 0}).to_list(1000)
    return results

# ============ Dashboard Routes ============

@api_router.get("/dashboard/admin")
async def get_admin_dashboard(current_user: dict = Depends(get_admin_user)):
    total_exams = await db.exams.count_documents({})
    total_subjects = await db.subjects.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_submissions = await db.student_exams.count_documents({"status": {"$in": ["submitted", "graded"]}})
    
    return {
        "total_exams": total_exams,
        "total_subjects": total_subjects,
        "total_students": total_students,
        "total_submissions": total_submissions
    }

@api_router.get("/dashboard/student")
async def get_student_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'student':
        raise HTTPException(status_code=403, detail="Student access only")
    
    completed = await db.student_exams.count_documents({
        "student_id": current_user['user_id'],
        "status": {"$in": ["submitted", "graded"]}
    })
    
    in_progress = await db.student_exams.count_documents({
        "student_id": current_user['user_id'],
        "status": "in_progress"
    })
    
    # Calculate average score
    graded_exams = await db.student_exams.find({
        "student_id": current_user['user_id'],
        "status": "graded",
        "score": {"$exists": True}
    }, {"_id": 0, "score": 1, "total_points": 1}).to_list(1000)
    
    avg_score = 0
    if graded_exams:
        total_percentage = sum((e['score'] / e['total_points'] * 100) for e in graded_exams)
        avg_score = total_percentage / len(graded_exams)
    
    return {
        "completed_exams": completed,
        "in_progress": in_progress,
        "average_score": round(avg_score, 2)
    }

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()