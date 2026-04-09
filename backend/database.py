import os
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def get_supabase_client() -> Optional[Client]:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        return None

class CareerData(BaseModel):
    name: str
    age: str
    education: str
    skills: str
    interests: str
    goal: Optional[str] = ""
    recommended_career: str

def save_career_data(data: CareerData):
    client = get_supabase_client()
    if client is None:
        print("Supabase client is not configured. Saving skipped.")
        return None
    
    try:
        response = client.table("users_career_data").insert({
            "name": data.name,
            "age": data.age,
            "education": data.education,
            "skills": data.skills,
            "interests": data.interests,
            "goal": data.goal,
            "recommended_career": data.recommended_career
        }).execute()
        return response
    except Exception as e:
        print(f"Failed to save to Supabase: {e}")
        return None
