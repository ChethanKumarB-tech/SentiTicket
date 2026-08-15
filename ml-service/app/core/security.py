from fastapi import Header, HTTPException, status
import os

INTERNAL_SECRET = os.getenv("ML_SERVICE_SECRET", "development_internal_ml_service_shared_secret_12345")

def verify_ml_service_auth(x_ml_service_token: str = Header(None)):
    if not x_ml_service_token or x_ml_service_token != INTERNAL_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized internal service access"
        )
    return True
