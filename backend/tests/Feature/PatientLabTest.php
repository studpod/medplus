<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\LabsResult;
use App\Models\AppointmentService;
use App\Http\Middleware\FirebaseAuth;

class PatientLabTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_get_labs()
    {
        $this->withoutMiddleware(FirebaseAuth::class);

        $patientUser = User::create([
            'firebase_uid' => 'pat_lab',
            'role' => 'patient'
        ]);

        $doctorUser = User::create([
            'firebase_uid' => 'doc_lab',
            'role' => 'doctor'
        ]);

        $spec = Specialization::create([
            'name' => 'Lab',
            'description' => 'Test'
        ]);

        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'specialization_id' => $spec->id,
            'first_name' => 'Doc',
            'last_name' => 'Test',
            'middle_name' => 'T',
            'phone' => '123'
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'doctor_id' => $doctor->id,
            'first_name' => 'Pat',
            'last_name' => 'Test',
            'middle_name' => 'T',
            'gender' => 'male',
            'address' => 'Test',
            'date_of_birth' => '2000-01-01',
            'phone' => '123'
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => now()->addDay(),
            'time' => '10:00',
            'status' => 'completed'
        ]);

        $service = Service::create([
            'specialization_id' => $spec->id,
            'name' => 'Blood test',
            'description' => 'Test',
            'price' => 100,
            'type' => 'consultation'
        ]);

        $appointmentService = AppointmentService::create([
            'appointment_id' => $appointment->id,
            'service_id' => $service->id,
            'price' => 100
        ]);

        LabsResult::create([
            'appointment_service_id' => $appointmentService->id,
            'labNumber' => 1
        ]);

        $this->actingAs($patientUser);

        $response = $this->getJson('/api/patient/view/labs');

        $response->assertStatus(200);

        $response->assertJsonStructure([
            'labs'
        ]);

        $this->assertNotEmpty($response->json('labs'));
    }

    public function test_patient_labs_filter_by_date()
    {
        $this->withoutMiddleware(FirebaseAuth::class);

        $patientUser = User::create([
            'firebase_uid' => 'pat_lab2',
            'role' => 'patient'
        ]);

        $doctorUser = User::create([
            'firebase_uid' => 'doc_lab2',
            'role' => 'doctor'
        ]);

        $spec = Specialization::create([
            'name' => 'Lab',
            'description' => 'Test'
        ]);

        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'specialization_id' => $spec->id,
            'first_name' => 'Doc',
            'last_name' => 'Test',
            'middle_name' => 'T',
            'phone' => '123'
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'doctor_id' => $doctor->id,
            'first_name' => 'Pat',
            'last_name' => 'Test',
            'middle_name' => 'T',
            'gender' => 'male',
            'address' => 'Test',
            'date_of_birth' => '2000-01-01',
            'phone' => '123'
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => now()->addDay(),
            'time' => '10:00',
            'status' => 'completed'
        ]);

        $service = Service::create([
            'specialization_id' => $spec->id,
            'name' => 'Blood test',
            'description' => 'Test',
            'price' => 100,
            'type' => 'consultation'
        ]);

        $appointmentService = AppointmentService::create([
            'appointment_id' => $appointment->id,
            'service_id' => $service->id,
            'price' => 100
        ]);

        LabsResult::create([
            'appointment_service_id' => $appointmentService->id,
            'labNumber' => 1,

        ]);

        LabsResult::create([
            'appointment_service_id' => $appointmentService->id,
            'labNumber' => 2,

        ]);

        $this->actingAs($patientUser);

        $response = $this->getJson('/api/patient/view/labs?date=' . now()->toDateString());

        $response->assertStatus(200);

        $this->assertIsArray($response->json('labs'));
        $this->assertNotEmpty($response->json('labs'));
    }
}
