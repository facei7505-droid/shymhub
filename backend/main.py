from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import uuid
import os

# --- Config ---
SECRET_KEY = os.getenv("SECRET_KEY", "shymkent-hub-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# --- App ---
app = FastAPI(title="Shymkent Hub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# --- In-memory storage ---
users_db: dict = {}
problems_db: dict = {}
votes_db: dict = {}

# --- Seed data ---
def seed_data():
    if not users_db:
        admin_id = str(uuid.uuid4())
        users_db[admin_id] = {
            "id": admin_id,
            "name": "Айдар Касымов",
            "email": "aidar@shymkent.kz",
            "password": get_password_hash("password"),
            "role": "citizen",
            "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
            "votesCount": 42,
            "problemsReportedCount": 3,
            "district": "Аль-Фарабийский",
        }
        inspector_id = str(uuid.uuid4())
        users_db[inspector_id] = {
            "id": inspector_id,
            "name": "Инспектор ЖКХ (Акимат)",
            "email": "inspector@shymkent.gov.kz",
            "password": get_password_hash("password"),
            "role": "inspector",
            "avatarUrl": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
            "votesCount": 156,
            "problemsReportedCount": 12,
            "district": "Аль-Фарабийский",
        }

seed_data()

# --- Models ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "citizen"
    district: Optional[str] = "Аль-Фарабийский"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatarUrl: str
    votesCount: int
    problemsReportedCount: int
    district: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ProblemCreate(BaseModel):
    title: str
    description: str
    district: str
    category: str
    imageUrl: str
    locationLat: float
    locationLng: float
    address: Optional[str] = ""
    urgencyLevel: Optional[str] = "medium"
    authorId: Optional[str] = None
    authorName: Optional[str] = None

class ProblemResponse(BaseModel):
    id: str
    title: str
    description: str
    district: str
    category: str
    imageUrl: str
    resolvedImageUrl: Optional[str] = None
    resolvedAt: Optional[str] = None
    resolvedNote: Optional[str] = None
    eloRating: float
    matchesPlayed: int
    winsCount: int
    locationLat: float
    locationLng: float
    address: Optional[str] = ""
    status: str
    urgencyLevel: Optional[str] = None
    createdAt: str
    authorId: Optional[str] = None
    authorName: Optional[str] = None

class VoteRequest(BaseModel):
    winner_id: str
    loser_id: str
    user_id: Optional[str] = None

# --- Helpers ---
def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None or user_id not in users_db:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return users_db[user_id]

def user_to_response(user: dict) -> UserResponse:
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        avatarUrl=user.get("avatarUrl", ""),
        votesCount=user.get("votesCount", 0),
        problemsReportedCount=user.get("problemsReportedCount", 0),
        district=user.get("district"),
    )

def problem_to_response(problem: dict) -> ProblemResponse:
    return ProblemResponse(
        id=problem["id"],
        title=problem["title"],
        description=problem["description"],
        district=problem["district"],
        category=problem["category"],
        imageUrl=problem["imageUrl"],
        resolvedImageUrl=problem.get("resolvedImageUrl"),
        resolvedAt=problem.get("resolvedAt"),
        resolvedNote=problem.get("resolvedNote"),
        eloRating=problem.get("eloRating", 1000),
        matchesPlayed=problem.get("matchesPlayed", 0),
        winsCount=problem.get("winsCount", 0),
        locationLat=problem["locationLat"],
        locationLng=problem["locationLng"],
        address=problem.get("address", ""),
        status=problem.get("status", "open"),
        urgencyLevel=problem.get("urgencyLevel"),
        createdAt=problem["createdAt"],
        authorId=problem.get("authorId"),
        authorName=problem.get("authorName"),
    )

# --- Routes ---

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "shymkent-hub-api"}

@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserRegister):
    for u in users_db.values():
        if u["email"] == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "role": user_data.role,
        "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        "votesCount": 0,
        "problemsReportedCount": 0,
        "district": user_data.district or "Аль-Фарабийский",
    }
    users_db[user_id] = user
    access_token = create_access_token(data={"sub": user_id})
    return Token(access_token=access_token, token_type="bearer", user=user_to_response(user))

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = None
    for u in users_db.values():
        if u["email"] == form_data.username:
            user = u
            break
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user["id"]})
    return Token(access_token=access_token, token_type="bearer", user=user_to_response(user))

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return user_to_response(current_user)

@app.get("/api/problems", response_model=List[ProblemResponse])
def get_problems():
    return [problem_to_response(p) for p in problems_db.values()]

@app.post("/api/problems", response_model=ProblemResponse)
def create_problem(problem_data: ProblemCreate, current_user: dict = Depends(get_current_user)):
    problem_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    problem = {
        "id": problem_id,
        "title": problem_data.title,
        "description": problem_data.description,
        "district": problem_data.district,
        "category": problem_data.category,
        "imageUrl": problem_data.imageUrl,
        "resolvedImageUrl": None,
        "resolvedAt": None,
        "resolvedNote": None,
        "eloRating": 1000.0,
        "matchesPlayed": 0,
        "winsCount": 0,
        "locationLat": problem_data.locationLat,
        "locationLng": problem_data.locationLng,
        "address": problem_data.address or "",
        "status": "open",
        "urgencyLevel": problem_data.urgencyLevel or "medium",
        "createdAt": now,
        "authorId": current_user["id"],
        "authorName": current_user["name"],
    }
    problems_db[problem_id] = problem
    current_user["problemsReportedCount"] = current_user.get("problemsReportedCount", 0) + 1
    users_db[current_user["id"]] = current_user
    return problem_to_response(problem)

@app.patch("/api/problems/{problem_id}/status", response_model=ProblemResponse)
def update_status(problem_id: str, status_data: dict, current_user: dict = Depends(get_current_user)):
    if problem_id not in problems_db:
        raise HTTPException(status_code=404, detail="Problem not found")
    problems_db[problem_id]["status"] = status_data.get("status", problems_db[problem_id]["status"])
    return problem_to_response(problems_db[problem_id])

@app.patch("/api/problems/{problem_id}/resolve", response_model=ProblemResponse)
def resolve_problem(problem_id: str, resolve_data: dict, current_user: dict = Depends(get_current_user)):
    if problem_id not in problems_db:
        raise HTTPException(status_code=404, detail="Problem not found")
    problem = problems_db[problem_id]
    problem["resolvedImageUrl"] = resolve_data.get("resolved_image_url")
    problem["resolvedNote"] = resolve_data.get("resolved_note")
    problem["resolvedAt"] = datetime.utcnow().isoformat()
    problem["status"] = "resolved"
    return problem_to_response(problem)

@app.delete("/api/problems/{problem_id}")
def delete_problem(problem_id: str, current_user: dict = Depends(get_current_user)):
    if problem_id not in problems_db:
        raise HTTPException(status_code=404, detail="Problem not found")
    del problems_db[problem_id]
    return {"ok": True}

@app.post("/api/vote")
def record_vote(vote_data: VoteRequest, current_user: dict = Depends(get_current_user)):
    vote_id = str(uuid.uuid4())
    votes_db[vote_id] = {
        "id": vote_id,
        "winnerId": vote_data.winner_id,
        "loserId": vote_data.loser_id,
        "userId": current_user["id"],
        "timestamp": datetime.utcnow().isoformat(),
    }
    current_user["votesCount"] = current_user.get("votesCount", 0) + 1
    users_db[current_user["id"]] = current_user
    return {"ok": True, "voteId": vote_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
