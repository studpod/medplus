<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialization;
use App\Http\Middleware\FirebaseAuth;

class MedicalRecordValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_medical_record_validation_fails()
    {
        $doctorUser = User::create([
            'firebase_uid' => 'doc_val',
            'role' => 'doctor'
        ]);

        $patientUser = User::create([
            'firebase_uid' => 'pat_val',
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

        $this->withoutMiddleware();

        $this->actingAs($doctorUser);

        $response = $this->postJson(
            "/api/doctor/control/patient/{$patient->id}/medical-card/add",
            []
        );

        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'chief_complaint',
            'initial_review'
        ]);
    }
}
