import os
import json
from typing import Literal
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from state import AgentState

load_dotenv()

llm = None # Bypassed

def chatbot_node(state: AgentState):
    """Generates the next question using mock logic."""
    missing_fields = []
    if not state.get("name"): missing_fields.append("name")
    elif not state.get("age"): missing_fields.append("age")
    elif not state.get("education"): missing_fields.append("education")
    elif not state.get("skills"): missing_fields.append("skills")
    elif not state.get("interests"): missing_fields.append("interests")
    elif state.get("goal") is None: missing_fields.append("goal (optional)")

    if not missing_fields:
        return {"is_complete": True}
    
    target_field = missing_fields[0]
    
    prompts = {
        "name": "What is your name?",
        "age": "What is your age?",
        "education": "What is your education?",
        "skills": "What are your skills?",
        "interests": "What are your interests?",
        "goal (optional)": "What is your career goal?"
    }
    
    msg_content = prompts.get(target_field, "Please provide more information.")
    return {"messages": [AIMessage(content=msg_content)]}

def extractor_node(state: AgentState):
    """Extracts information from the latest user message without an LLM."""
    messages = state.get("messages", [])
    if not messages:
        return {}
    
    last_message = messages[-1]
    if not isinstance(last_message, HumanMessage):
        return {}
        
    text = last_message.content.strip()
    
    updates = {}
    if not state.get("name"): updates = {"name": text}
    elif not state.get("age"): updates = {"age": text}
    elif not state.get("education"): updates = {"education": text}
    elif not state.get("skills"): updates = {"skills": text}
    elif not state.get("interests"): updates = {"interests": text}
    elif state.get("goal") is None: 
        if any(w in text.lower() for w in ['skip', 'none', 'no']):
            updates = {"goal": "Skipped"}
        else:
            updates = {"goal": text}
            
    print("--- EXTRACTOR NODE ---")
    print(f"User Message: {text}")
    print(f"State Updates: {updates}")
    
    return updates

def analyzer_node(state: AgentState):
    """Generates a mock career recommendation based on skills."""
    user_skills = state.get('skills', '').lower()
    
    if "coding" in user_skills:
        rec_career = "Software Developer"
        skills = ["Python", "React", "Data Structures"]
        steps = ["Learn to code.", "Build projects.", "Apply for jobs."]
    elif "design" in user_skills:
        rec_career = "UI/UX Designer"
        skills = ["Figma", "User Research", "Prototyping"]
        steps = ["Learn design principles.", "Create a portfolio.", "Network with designers."]
    elif "management" in user_skills:
        rec_career = "Business Analyst"
        skills = ["SQL", "Agile", "Stakeholder Management"]
        steps = ["Learn data analysis.", "Understand agile.", "Coordinate with teams."]
    else:
        rec_career = "Software Developer"
        skills = ["Problem Solving", "Communication", "Tech Fundamentals"]
        steps = ["Explore different tech roles.", "Pick a specialization.", "Gain practical experience."]

    why = f"Based on your skills in {state.get('skills', 'technology')}, you have a great foundation to pursue a career in {rec_career}."
    
    final_msg = f"**Recommended Career:** {rec_career}\n\n**Why this fits you:**\n{why}\n\n**Skills to Learn:**\n{', '.join(skills)}\n\n**Roadmap:**\n"
    for i, step in enumerate(steps, 1):
         final_msg += f"{i}. {step}\n"
         
    return {
        "recommended_career": rec_career,
        "messages": [AIMessage(content=final_msg)],
        "is_complete": True
    }

def start_router(state: AgentState) -> Literal["chatbot", "extractor"]:
    messages = state.get("messages", [])
    if not messages:
        return "chatbot"
    
    last_message = messages[-1]
    if isinstance(last_message, HumanMessage):
        return "extractor"
        
    return "chatbot"

def route_after_extraction(state: AgentState) -> Literal["chatbot", "analyzer"]:
    missing_fields = []
    if not state.get("name"): missing_fields.append("name")
    elif not state.get("age"): missing_fields.append("age")
    elif not state.get("education"): missing_fields.append("education")
    elif not state.get("skills"): missing_fields.append("skills")
    elif not state.get("interests"): missing_fields.append("interests")
    elif state.get("goal") is None: missing_fields.append("goal")
        
    print(f"--- ROUTER NODE --- Missing Fields Left: {missing_fields}")
    
    if not missing_fields:
        return "analyzer"
    return "chatbot"


# Build Graph
builder = StateGraph(AgentState)

builder.add_node("chatbot", chatbot_node)
builder.add_node("extractor", extractor_node)
builder.add_node("analyzer", analyzer_node)

builder.set_conditional_entry_point(
    start_router,
    {
        "chatbot": "chatbot",
        "extractor": "extractor"
    }
)

builder.add_conditional_edges(
    "extractor",
    route_after_extraction,
    {
        "chatbot": "chatbot",
        "analyzer": "analyzer"
    }
)

builder.add_edge("chatbot", END)
builder.add_edge("analyzer", END)

graph = builder.compile()
