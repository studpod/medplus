<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Models\{
    User,
    Doctor,
    Patient,
    Specialization,
    Service,
    Appointment,
    AppointmentService,
    DoctorSchedules,
    Receptionist
};

use App\Http\Middleware\FirebaseAuth;

class ReceptionistFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware();
    }

    private function base()
    {
        $spec = Specialization::create([
            'name' => 'Therapy',
            'description' => 'Test'
        ]);

        $doctorUser = User::create([
            'firebase_uid' => 'doc_1',
            'role' => 'doctor'
        ]);

        $receptionUser = User::create([
            'firebase_uid' => 'rec_1',
            'role' => 'receptionist'
        ]);

        Receptionist::create([
            'user_id' => $receptionUser->id,
            'last_name' => 'Rec',
            'first_name' => 'Test',
            'middle_name' => null,
            'phone' => '123456789'
        ]);

        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'specialization_id' => $spec->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'M',
            'phone' => '123'
        ]);

        $patient = Patient::create([
            'user_id' => null,
            'doctor_id' => $doctor->id,
            'first_name' => 'Ann',
            'last_name' => 'Smith',
            'middle_name' => 'K',
            'gender' => 'female',
            'address' => 'Street',
            'date_of_birth' => '2000-01-01',
            'phone' => '999'
        ]);

        $service = Service::create([
            'specialization_id' => $spec->id,
            'name' => 'Consultation',
            'description' => 'Test',
            'price' => 100,
            'type' => 'consultation'
        ]);

        DoctorSchedules::create([
            'doctor_id' => $doctor->id,
            'day_of_week' => now()->format('l'),
            'start_time' => '08:00:00',
            'end_time' => '18:00:00'
        ]);

        return compact('spec', 'doctorUser', 'receptionUser', 'doctor', 'patient', 'service');
    }

    public function test_specializations()
    {
        $response = $this->getJson('/api/public/view/specializations');

        $response->assertStatus(200);
    }

    public function test_doctors_by_specialization()
    {
        $data = $this->base();

        $response = $this->getJson(
            "/api/public/view/doctors/specialization/{$data['spec']->id}"
        );

        $response->assertStatus(200);
    }

    public function test_patients_list()
    {
        $this->base();

        $response = $this->getJson('/api/receptionist/view/patients');

        $response->assertStatus(200);
    }

    public function test_search_patients()
    {
        $this->base();

        $response = $this->getJson('/api/receptionist/view/patients/search?q=Sm');

        $response->assertStatus(200);
    }

    public function test_services_by_doctor()
    {
        $data = $this->base();

        $response = $this->getJson(
            "/api/receptionist/view/services-by-doctor/{$data['doctor']->id}"
        );

        $response->assertStatus(200);
    }

    public function test_available_times()
    {
        $data = $this->base();

        $response = $this->getJson(
            '/api/receptionist/view/doctor-available-times?' . http_build_query([
                'doctor_id' => $data['doctor']->id,
                'date' => now()->toDateString()
            ])
        );

        $response->assertStatus(200);
    }

    public function test_create_appointment()
    {
        $data = $this->base();

        $response = $this->postJson('/api/receptionist/control/appointments/create', [
            'patient_id' => $data['patient']->id,
            'doctor_id' => $data['doctor']->id,
            'date' => now()->toDateString(),
            'time' => '10:00',
            'services' => [$data['service']->id]
        ]);

        $response->assertStatus(200);
    }

    public function test_get_appointments()
    {
        $data = $this->base();

        Appointment::create([
            'patient_id' => $data['patient']->id,
            'doctor_id' => $data['doctor']->id,
            'date' => now()->toDateString(),
            'time' => '10:00',
            'status' => 'expected'
        ]);

        $response = $this->getJson('/api/receptionist/view/appointments');

        $response->assertStatus(200);
    }

    public function test_receptionist_me()
    {
        $data = $this->base();

        $this->actingAs($data['receptionUser']);

        $response = $this->getJson('/api/receptionist/view/me');

        $response->assertStatus(200);
    }
}
