from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from app.api.predict import router as predict_router
import os

app = FastAPI(
    title="SentiTicket ML Service",
    description="SLA breach risk prediction microservice for SentiTicket platform",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "sentiticket-ml-service"}

app.include_router(predict_router, prefix="/api/v1")
