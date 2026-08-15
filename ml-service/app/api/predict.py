from fastapi import APIRouter, Depends, status
from app.schemas.prediction_schema import PredictionRequest, PredictionResponse
from app.services.model_loader import predict_breach_risk
from app.core.security import verify_ml_service_auth

router = APIRouter()

@router.post(
    "/predict-sla",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_ml_service_auth)]
)
def predict_sla_breach(payload: PredictionRequest):
    return predict_breach_risk(payload)
