<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialization;
use App\Models\Appointment;
use App\Http\Middleware\FirebaseAuth;

class MedicalRecordTest extends TestCase
{
    use RefreshDatabase;

    public function test_doctor_can_create_medical_record()
    {
        $doctorUser = User::create([
            'firebase_uid' => 'doctor_uid_1',
            'role' => 'doctor'
        ]);


        $patientUser = User::create([
            'firebase_uid' => 'patient_uid_1',
            'role' => 'patient'
        ]);


        $specialization = Specialization::create([
            'name' => 'Therapist',
            'description' => 'General practice'
        ]);


        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'specialization_id' => $specialization->id,
            'first_name' => 'Ivan',
            'last_name' => 'Petrenko',
            'middle_name' => 'Ivanovich',
            'phone' => '380991112244'
        ]);


        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'doctor_id' => $doctor->id,
            'first_name' => 'Test',
            'last_name' => 'User',
            'middle_name' => 'Test',
            'gender' => 'male',
            'address' => 'Test Address',
            'date_of_birth' => '2000-01-01',
            'phone' => '380991112233'
        ]);


        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => now()->addDay()->format('Y-m-d'),
            'time' => '10:00',
            'status' => 'completed'
        ]);


        $this->withoutMiddleware(FirebaseAuth::class);
        $this->actingAs($doctorUser);


        $response = $this->postJson(
            "/api/doctor/control/patient/{$patient->id}/medical-card/add",
            [
                'appointment_id' => $appointment->id,
                'chief_complaint' => 'Headache',
                'anamnesis' => 'Pain for 2 days',
                'diagnosis' => 'Migraine',
                'initial_review' => 'Patient condition stable',
                'treatment' => 'Painkillers',
                'notes' => 'Patient should rest'
            ]
        );


        if ($response->status() !== 201) {
            dump($response->json());
        }


        $response->assertStatus(201);

        $this->assertDatabaseHas('medical_records', [
            'appointment_id' => $appointment->id,
            'diagnosis' => 'Migraine'
        ]);
    }

    public function test_patient_cannot_create_medical_record()
    {
        $patientUser = User::create([
            'firebase_uid' => 'patient_uid_2',
            'role' => 'patient'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);
        $this->actingAs($patientUser);

        $response = $this->postJson(
            "/api/doctor/control/patient/1/medical-card/add",
            [
                'chief_complaint' => 'Test'
            ]
        );

        $response->assertStatus(403);
    }
}
