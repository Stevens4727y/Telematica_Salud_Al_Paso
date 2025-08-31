from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Salud al Paso API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic models for the health app

# Emergency models
class EmergencyReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    phone: str
    location: dict  # {latitude: float, longitude: float, address: str}
    emergency_type: str
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, in_progress, resolved

class EmergencyCreate(BaseModel):
    patient_name: str
    phone: str
    location: dict
    emergency_type: str
    description: str

# Medical appointment models
class MedicalAppointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    patient_phone: str
    doctor_name: str
    specialty: str
    appointment_date: date
    appointment_time: str
    reason: str
    status: str = "scheduled"  # scheduled, confirmed, completed, cancelled
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat(),
            datetime: lambda v: v.isoformat()
        }

class AppointmentCreate(BaseModel):
    patient_name: str
    patient_phone: str
    doctor_name: str
    specialty: str
    appointment_date: date
    appointment_time: str
    reason: str

class AppointmentUpdate(BaseModel):
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

# Medical consultation models
class MedicalConsultation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    patient_phone: str
    doctor_name: str
    consultation_type: str  # virtual, presential
    symptoms: str
    consultation_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, in_progress, completed
    diagnosis: Optional[str] = ""
    treatment: Optional[str] = ""
    follow_up_date: Optional[date] = None

class ConsultationCreate(BaseModel):
    patient_name: str
    patient_phone: str
    doctor_name: str
    consultation_type: str
    symptoms: str

# Health tips model
class HealthTip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str
    image_url: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

# Emergency endpoints
@api_router.post("/emergencies", response_model=EmergencyReport)
async def create_emergency_report(emergency: EmergencyCreate):
    """Create a new emergency report"""
    emergency_dict = emergency.dict()
    emergency_obj = EmergencyReport(**emergency_dict)
    
    # Insert into MongoDB
    result = await db.emergencies.insert_one(emergency_obj.dict())
    
    # Simulate sending notification
    logger.info(f"EMERGENCY ALERT: {emergency_obj.emergency_type} reported by {emergency_obj.patient_name}")
    logger.info(f"Location: {emergency_obj.location}")
    
    return emergency_obj

@api_router.get("/emergencies", response_model=List[EmergencyReport])
async def get_emergencies():
    """Get all emergency reports"""
    emergencies = await db.emergencies.find().to_list(1000)
    return [EmergencyReport(**emergency) for emergency in emergencies]

@api_router.put("/emergencies/{emergency_id}")
async def update_emergency_status(emergency_id: str, status: str):
    """Update emergency status"""
    result = await db.emergencies.update_one(
        {"id": emergency_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return {"message": "Emergency status updated"}

# Medical appointments endpoints
@api_router.post("/appointments", response_model=MedicalAppointment)
async def create_appointment(appointment: AppointmentCreate):
    """Create a new medical appointment"""
    appointment_dict = appointment.dict()
    appointment_obj = MedicalAppointment(**appointment_dict)
    
    # Convert date objects to strings for MongoDB storage
    appointment_data = appointment_obj.dict()
    if 'appointment_date' in appointment_data and isinstance(appointment_data['appointment_date'], date):
        appointment_data['appointment_date'] = appointment_data['appointment_date'].isoformat()
    if 'created_at' in appointment_data and isinstance(appointment_data['created_at'], datetime):
        appointment_data['created_at'] = appointment_data['created_at'].isoformat()
    
    result = await db.appointments.insert_one(appointment_data)
    return appointment_obj

@api_router.get("/appointments", response_model=List[MedicalAppointment])
async def get_appointments():
    """Get all medical appointments"""
    appointments = await db.appointments.find().sort("appointment_date", 1).to_list(1000)
    # Convert string dates back to date objects
    for appointment in appointments:
        if 'appointment_date' in appointment and isinstance(appointment['appointment_date'], str):
            appointment['appointment_date'] = datetime.fromisoformat(appointment['appointment_date']).date()
        if 'created_at' in appointment and isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    return [MedicalAppointment(**appointment) for appointment in appointments]

@api_router.get("/appointments/{appointment_id}", response_model=MedicalAppointment)
async def get_appointment(appointment_id: str):
    """Get a specific appointment"""
    appointment = await db.appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return MedicalAppointment(**appointment)

@api_router.put("/appointments/{appointment_id}", response_model=MedicalAppointment)
async def update_appointment(appointment_id: str, appointment_update: AppointmentUpdate):
    """Update a medical appointment"""
    update_data = {k: v for k, v in appointment_update.dict().items() if v is not None}
    
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    updated_appointment = await db.appointments.find_one({"id": appointment_id})
    return MedicalAppointment(**updated_appointment)

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    """Delete a medical appointment"""
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

# Medical consultations endpoints
@api_router.post("/consultations", response_model=MedicalConsultation)
async def create_consultation(consultation: ConsultationCreate):
    """Create a new medical consultation"""
    consultation_dict = consultation.dict()
    consultation_obj = MedicalConsultation(**consultation_dict)
    
    result = await db.consultations.insert_one(consultation_obj.dict())
    return consultation_obj

@api_router.get("/consultations", response_model=List[MedicalConsultation])
async def get_consultations():
    """Get all medical consultations"""
    consultations = await db.consultations.find().sort("consultation_date", -1).to_list(1000)
    return [MedicalConsultation(**consultation) for consultation in consultations]

@api_router.get("/consultations/{consultation_id}", response_model=MedicalConsultation)
async def get_consultation(consultation_id: str):
    """Get a specific consultation"""
    consultation = await db.consultations.find_one({"id": consultation_id})
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return MedicalConsultation(**consultation)

# Health tips endpoints
@api_router.get("/health-tips", response_model=List[HealthTip])
async def get_health_tips():
    """Get all health tips"""
    # Return static health tips for now
    static_tips = [
        {
            "id": "tip-1",
            "title": "Hidratación Diaria",
            "content": "Bebe al menos 8 vasos de agua al día para mantener tu cuerpo hidratado y ayudar a tu organismo a funcionar correctamente.",
            "category": "Nutrición",
            "image_url": "",
            "is_active": True
        },
        {
            "id": "tip-2", 
            "title": "Ejercicio Regular",
            "content": "Realiza al menos 30 minutos de actividad física moderada 5 días a la semana para mantener un corazón saludable.",
            "category": "Ejercicio",
            "image_url": "",
            "is_active": True
        },
        {
            "id": "tip-3",
            "title": "Descanso Adecuado",
            "content": "Duerme entre 7-9 horas cada noche para permitir que tu cuerpo se recupere y tu mente se regenere.",
            "category": "Descanso",
            "image_url": "",
            "is_active": True
        },
        {
            "id": "tip-4",
            "title": "Alimentación Balanceada",
            "content": "Incluye frutas, verduras, proteínas magras y granos enteros en tu dieta diaria para obtener todos los nutrientes necesarios.",
            "category": "Nutrición",
            "image_url": "",
            "is_active": True
        },
        {
            "id": "tip-5",
            "title": "Chequeos Médicos",
            "content": "Realiza chequeos médicos regulares para detectar problemas de salud a tiempo y mantener un historial médico actualizado.",
            "category": "Prevención",
            "image_url": "",
            "is_active": True
        },
        {
            "id": "tip-6",
            "title": "Manejo del Estrés",
            "content": "Practica técnicas de relajación como meditación, yoga o respiración profunda para reducir el estrés diario.",
            "category": "Bienestar Mental",
            "image_url": "",
            "is_active": True
        }
    ]
    
    return [HealthTip(**tip) for tip in static_tips]

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Salud al Paso API - UNAN", "version": "1.0.0"}

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()