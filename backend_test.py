#!/usr/bin/env python3
"""
Backend API Testing for Salud al Paso Health App
Tests all API endpoints with realistic health data
"""

import requests
import json
from datetime import datetime, date
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://unan-health.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing backend API at: {API_BASE_URL}")

class HealthAppAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n=== Testing Basic Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{API_BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "Salud al Paso API" in data.get("message", ""):
                    self.log_test("GET /api/ (root endpoint)", True, f"Response: {data}")
                else:
                    self.log_test("GET /api/ (root endpoint)", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/ (root endpoint)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/ (root endpoint)", False, f"Error: {str(e)}")
            
        # Test health check endpoint
        try:
            response = self.session.get(f"{API_BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("GET /api/health (health check)", True, f"Status: {data['status']}")
                else:
                    self.log_test("GET /api/health (health check)", False, f"Unexpected status: {data}")
            else:
                self.log_test("GET /api/health (health check)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/health (health check)", False, f"Error: {str(e)}")
    
    def test_emergency_endpoints(self):
        """Test emergency report endpoints"""
        print("\n=== Testing Emergency Endpoints ===")
        
        # Test data for emergency
        emergency_data = {
            "patient_name": "María González",
            "phone": "+505-8765-4321",
            "location": {
                "latitude": 12.1364,
                "longitude": -86.2514,
                "address": "Universidad Nacional Autónoma de Nicaragua, Managua"
            },
            "emergency_type": "Accidente cardiovascular",
            "description": "Paciente presenta dolor en el pecho y dificultad para respirar"
        }
        
        # Test POST /api/emergencies
        try:
            response = self.session.post(
                f"{API_BASE_URL}/emergencies",
                json=emergency_data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                emergency_response = response.json()
                emergency_id = emergency_response.get("id")
                if emergency_id and emergency_response.get("patient_name") == emergency_data["patient_name"]:
                    self.log_test("POST /api/emergencies (create emergency)", True, f"Created emergency ID: {emergency_id}")
                    
                    # Test PUT /api/emergencies/{emergency_id} - update status
                    try:
                        update_response = self.session.put(
                            f"{API_BASE_URL}/emergencies/{emergency_id}?status=in_progress"
                        )
                        if update_response.status_code == 200:
                            self.log_test("PUT /api/emergencies/{id} (update status)", True, "Status updated to in_progress")
                        else:
                            self.log_test("PUT /api/emergencies/{id} (update status)", False, f"Status: {update_response.status_code}")
                    except Exception as e:
                        self.log_test("PUT /api/emergencies/{id} (update status)", False, f"Error: {str(e)}")
                        
                else:
                    self.log_test("POST /api/emergencies (create emergency)", False, f"Invalid response: {emergency_response}")
            else:
                self.log_test("POST /api/emergencies (create emergency)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/emergencies (create emergency)", False, f"Error: {str(e)}")
        
        # Test GET /api/emergencies
        try:
            response = self.session.get(f"{API_BASE_URL}/emergencies")
            if response.status_code == 200:
                emergencies = response.json()
                if isinstance(emergencies, list):
                    self.log_test("GET /api/emergencies (list emergencies)", True, f"Retrieved {len(emergencies)} emergencies")
                else:
                    self.log_test("GET /api/emergencies (list emergencies)", False, f"Expected list, got: {type(emergencies)}")
            else:
                self.log_test("GET /api/emergencies (list emergencies)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/emergencies (list emergencies)", False, f"Error: {str(e)}")
    
    def test_appointments_endpoints(self):
        """Test medical appointments CRUD endpoints"""
        print("\n=== Testing Medical Appointments Endpoints ===")
        
        # Test data for appointment
        appointment_data = {
            "patient_name": "Carlos Mendoza",
            "patient_phone": "+505-7654-3210",
            "doctor_name": "Dr. Ana Rodríguez",
            "specialty": "Cardiología",
            "appointment_date": "2025-01-20",
            "appointment_time": "10:30",
            "reason": "Chequeo rutinario del corazón"
        }
        
        appointment_id = None
        
        # Test POST /api/appointments
        try:
            response = self.session.post(
                f"{API_BASE_URL}/appointments",
                json=appointment_data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                appointment_response = response.json()
                appointment_id = appointment_response.get("id")
                if appointment_id and appointment_response.get("patient_name") == appointment_data["patient_name"]:
                    self.log_test("POST /api/appointments (create appointment)", True, f"Created appointment ID: {appointment_id}")
                else:
                    self.log_test("POST /api/appointments (create appointment)", False, f"Invalid response: {appointment_response}")
            else:
                self.log_test("POST /api/appointments (create appointment)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/appointments (create appointment)", False, f"Error: {str(e)}")
        
        # Test GET /api/appointments
        try:
            response = self.session.get(f"{API_BASE_URL}/appointments")
            if response.status_code == 200:
                appointments = response.json()
                if isinstance(appointments, list):
                    self.log_test("GET /api/appointments (list appointments)", True, f"Retrieved {len(appointments)} appointments")
                else:
                    self.log_test("GET /api/appointments (list appointments)", False, f"Expected list, got: {type(appointments)}")
            else:
                self.log_test("GET /api/appointments (list appointments)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/appointments (list appointments)", False, f"Error: {str(e)}")
        
        if appointment_id:
            # Test GET /api/appointments/{appointment_id}
            try:
                response = self.session.get(f"{API_BASE_URL}/appointments/{appointment_id}")
                if response.status_code == 200:
                    appointment = response.json()
                    if appointment.get("id") == appointment_id:
                        self.log_test("GET /api/appointments/{id} (get specific appointment)", True, f"Retrieved appointment: {appointment['patient_name']}")
                    else:
                        self.log_test("GET /api/appointments/{id} (get specific appointment)", False, f"ID mismatch: {appointment}")
                else:
                    self.log_test("GET /api/appointments/{id} (get specific appointment)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("GET /api/appointments/{id} (get specific appointment)", False, f"Error: {str(e)}")
            
            # Test PUT /api/appointments/{appointment_id}
            update_data = {
                "status": "confirmed",
                "notes": "Paciente confirmó asistencia"
            }
            try:
                response = self.session.put(
                    f"{API_BASE_URL}/appointments/{appointment_id}",
                    json=update_data,
                    headers={"Content-Type": "application/json"}
                )
                if response.status_code == 200:
                    updated_appointment = response.json()
                    if updated_appointment.get("status") == "confirmed":
                        self.log_test("PUT /api/appointments/{id} (update appointment)", True, "Appointment updated successfully")
                    else:
                        self.log_test("PUT /api/appointments/{id} (update appointment)", False, f"Update failed: {updated_appointment}")
                else:
                    self.log_test("PUT /api/appointments/{id} (update appointment)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("PUT /api/appointments/{id} (update appointment)", False, f"Error: {str(e)}")
            
            # Test DELETE /api/appointments/{appointment_id}
            try:
                response = self.session.delete(f"{API_BASE_URL}/appointments/{appointment_id}")
                if response.status_code == 200:
                    delete_response = response.json()
                    if "deleted" in delete_response.get("message", "").lower():
                        self.log_test("DELETE /api/appointments/{id} (delete appointment)", True, "Appointment deleted successfully")
                    else:
                        self.log_test("DELETE /api/appointments/{id} (delete appointment)", False, f"Unexpected response: {delete_response}")
                else:
                    self.log_test("DELETE /api/appointments/{id} (delete appointment)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("DELETE /api/appointments/{id} (delete appointment)", False, f"Error: {str(e)}")
    
    def test_consultations_endpoints(self):
        """Test medical consultations endpoints"""
        print("\n=== Testing Medical Consultations Endpoints ===")
        
        # Test data for consultation
        consultation_data = {
            "patient_name": "Lucía Herrera",
            "patient_phone": "+505-5432-1098",
            "doctor_name": "Dr. Roberto Martínez",
            "consultation_type": "virtual",
            "symptoms": "Dolor de cabeza persistente y mareos ocasionales"
        }
        
        consultation_id = None
        
        # Test POST /api/consultations
        try:
            response = self.session.post(
                f"{API_BASE_URL}/consultations",
                json=consultation_data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                consultation_response = response.json()
                consultation_id = consultation_response.get("id")
                if consultation_id and consultation_response.get("patient_name") == consultation_data["patient_name"]:
                    self.log_test("POST /api/consultations (create consultation)", True, f"Created consultation ID: {consultation_id}")
                else:
                    self.log_test("POST /api/consultations (create consultation)", False, f"Invalid response: {consultation_response}")
            else:
                self.log_test("POST /api/consultations (create consultation)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/consultations (create consultation)", False, f"Error: {str(e)}")
        
        # Test GET /api/consultations
        try:
            response = self.session.get(f"{API_BASE_URL}/consultations")
            if response.status_code == 200:
                consultations = response.json()
                if isinstance(consultations, list):
                    self.log_test("GET /api/consultations (list consultations)", True, f"Retrieved {len(consultations)} consultations")
                else:
                    self.log_test("GET /api/consultations (list consultations)", False, f"Expected list, got: {type(consultations)}")
            else:
                self.log_test("GET /api/consultations (list consultations)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/consultations (list consultations)", False, f"Error: {str(e)}")
        
        if consultation_id:
            # Test GET /api/consultations/{consultation_id}
            try:
                response = self.session.get(f"{API_BASE_URL}/consultations/{consultation_id}")
                if response.status_code == 200:
                    consultation = response.json()
                    if consultation.get("id") == consultation_id:
                        self.log_test("GET /api/consultations/{id} (get specific consultation)", True, f"Retrieved consultation: {consultation['patient_name']}")
                    else:
                        self.log_test("GET /api/consultations/{id} (get specific consultation)", False, f"ID mismatch: {consultation}")
                else:
                    self.log_test("GET /api/consultations/{id} (get specific consultation)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("GET /api/consultations/{id} (get specific consultation)", False, f"Error: {str(e)}")
    
    def test_health_tips_endpoint(self):
        """Test health tips endpoint"""
        print("\n=== Testing Health Tips Endpoint ===")
        
        # Test GET /api/health-tips
        try:
            response = self.session.get(f"{API_BASE_URL}/health-tips")
            if response.status_code == 200:
                health_tips = response.json()
                if isinstance(health_tips, list) and len(health_tips) > 0:
                    # Check if tips have expected structure
                    first_tip = health_tips[0]
                    required_fields = ["id", "title", "content", "category"]
                    if all(field in first_tip for field in required_fields):
                        self.log_test("GET /api/health-tips (get health tips)", True, f"Retrieved {len(health_tips)} health tips")
                    else:
                        self.log_test("GET /api/health-tips (get health tips)", False, f"Missing required fields in tip: {first_tip}")
                else:
                    self.log_test("GET /api/health-tips (get health tips)", False, f"Expected non-empty list, got: {health_tips}")
            else:
                self.log_test("GET /api/health-tips (get health tips)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/health-tips (get health tips)", False, f"Error: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid appointment creation (missing required fields)
        try:
            invalid_appointment = {"patient_name": "Test"}  # Missing required fields
            response = self.session.post(
                f"{API_BASE_URL}/appointments",
                json=invalid_appointment,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 422:  # Validation error
                self.log_test("Error handling - Invalid appointment data", True, "Correctly returned validation error")
            else:
                self.log_test("Error handling - Invalid appointment data", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Error handling - Invalid appointment data", False, f"Error: {str(e)}")
        
        # Test non-existent resource
        try:
            fake_id = str(uuid.uuid4())
            response = self.session.get(f"{API_BASE_URL}/appointments/{fake_id}")
            if response.status_code == 404:
                self.log_test("Error handling - Non-existent appointment", True, "Correctly returned 404 for non-existent resource")
            else:
                self.log_test("Error handling - Non-existent appointment", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error handling - Non-existent appointment", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🏥 Starting Salud al Paso Backend API Tests")
        print("=" * 50)
        
        self.test_basic_endpoints()
        self.test_emergency_endpoints()
        self.test_appointments_endpoints()
        self.test_consultations_endpoints()
        self.test_health_tips_endpoint()
        self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = HealthAppAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend API is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the details above.")