from pydantic import BaseModel, Field
from typing import List, Optional

class PredictionRequest(BaseModel):
    ticket_id: str
    priority: str = Field(..., pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    category: str
    created_hour: int = Field(..., ge=0, le=23)
    created_day_of_week: int = Field(..., ge=0, le=6)
    agent_current_active_tickets: int = Field(default=0, ge=0)
    customer_tier: str = Field(default="STANDARD", pattern="^(STANDARD|ENTERPRISE|VIP)$")
    sla_duration_hours: float = Field(..., gt=0)
    initial_text_length: int = Field(default=0, ge=0)

class RiskFactor(BaseModel):
    factor: str
    impact: str
    description: str

class PredictionResponse(BaseModel):
    ticket_id: str
    breach_probability: float = Field(..., ge=0.0, le=1.0)
    predicted_risk_level: str = Field(..., pattern="^(SAFE|AT_RISK|CRITICAL)$")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    risk_factors: List[RiskFactor] = []
    is_model_trained: bool = False
