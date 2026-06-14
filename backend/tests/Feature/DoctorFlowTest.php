<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialization;
use App\Http\Middleware\FirebaseAuth;

class DoctorFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_doctor_can_view_patient_medical_card()
    {
        $doctorUser = User::create([
            'firebase_uid' => 'doc1',
            'role' => 'doctor'
        ]);

        $patientUser = User::create([
            'firebase_uid' => 'pat1',
            'role' => 'patient'
        ]);

        $spec = Specialization::create([
            'name' => 'Therapy',
            'description' => 'Test'
        ]);

        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'specialization_id' => $spec->id,
            'first_name' => 'Ivan',
            'last_name' => 'Test',
            'middle_name' => 'T',
            'phone' => '123'
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'doctor_id' => $doctor->id,
            'first_name' => 'Test',
            'last_name' => 'User',
            'middle_name' => 'T',
            'gender' => 'male',
            'address' => 'Test',
            'date_of_birth' => '2000-01-01',
            'phone' => '123'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);
        $this->actingAs($doctorUser);

        $response = $this->getJson("/api/doctor/view/patient/{$patient->id}/medical-card");

        $response->assertStatus(200);
    }

    public function test_patient_cannot_access_doctor_routes()
    {
        $patientUser = User::create([
            'firebase_uid' => 'pat2',
            'role' => 'patient'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);
        $this->actingAs($patientUser);

        $response = $this->getJson("/api/doctor/view/patient/1/medical-card");

        $response->assertStatus(403);
    }
}
