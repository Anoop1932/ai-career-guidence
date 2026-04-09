from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
import datetime
import httpx

from backend.agent import graph
from backend.database import save_career_data, CareerData

app = FastAPI(title="AI Career Guidance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str
    state: dict  # We'll pass the state back and forth for simplicity since it's stateless backend

class ChatResponse(BaseModel):
    reply: str
    new_state: dict
    is_complete: bool

async def trigger_webhook(data: dict):
    webhook_url = "https://relay.app/" # Dummy URL
    try:
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, json=data)
            print("Webhook triggered successfully")
    except Exception as e:
        print(f"Failed to trigger webhook: {e}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Reconstruct state from request
        current_state = request.state
        
        # Reconstruct messages
        messages = []
        for msg in current_state.get("messages", []):
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "ai":
                messages.append(AIMessage(content=msg["content"]))
        
        current_state["messages"] = messages
        
        if request.message:
            current_state["messages"].append(HumanMessage(content=request.message))
            
        # Run graph
        # Determine entry point based on if we have a user message
        if request.message:
             new_state = graph.invoke(current_state)
        else:
             # Initial call
             new_state = graph.invoke({"messages": []})
             
        # Extract reply
        last_msg = new_state["messages"][-1]
        reply_content = last_msg.content if hasattr(last_msg, 'content') else ""
        
        # Clean up messages for serialization
        serializable_messages = []
        for msg in new_state["messages"]:
            if isinstance(msg, HumanMessage):
                serializable_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                serializable_messages.append({"role": "ai", "content": msg.content})
                
        new_state["messages"] = serializable_messages
        
        is_complete = new_state.get("is_complete", False)
        
        # If complete, save to DB and trigger webhook
        if is_complete and new_state.get("recommended_career"):
            career_data = CareerData(
                name=new_state.get("name", "Unknown"),
                age=str(new_state.get("age", "Unknown")),
                education=new_state.get("education", "Unknown"),
                skills=new_state.get("skills", "Unknown"),
                interests=new_state.get("interests", "Unknown"),
                goal=new_state.get("goal", ""),
                recommended_career=new_state.get("recommended_career", "")
            )
            save_career_data(career_data)
            
            # Trigger webhook
            await trigger_webhook({
                 "name": career_data.name,
                 "age": career_data.age,
                 "skills": career_data.skills,
                 "interests": career_data.interests,
                 "recommended_career": career_data.recommended_career,
                 "timestamp": datetime.datetime.now().isoformat()
            })

        return ChatResponse(
            reply=reply_content,
            new_state=new_state,
            is_complete=is_complete
        )

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
