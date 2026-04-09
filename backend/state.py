from typing import TypedDict, Annotated, Optional
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    name: Optional[str]
    age: Optional[str]
    education: Optional[str]
    skills: Optional[str]
    interests: Optional[str]
    goal: Optional[str]
    recommended_career: Optional[str]
    is_complete: bool
