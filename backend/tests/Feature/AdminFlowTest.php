<?php

namespace Tests\Feature;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Models\{
    User,
    Doctor,
    Patient,
    Specialization,
    DoctorSchedules,
    Appointment
};

class AdminFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // вимикаємо ВСІ auth middleware
        $this->withoutMiddleware([
            \App\Http\Middleware\FirebaseAuth::class,
            \App\Http\Middleware\RoleMiddleware::class,
        ]);

        // створюємо fake admin
        $admin = User::create([
            'firebase_uid' => 'YOhPi0QH3XUvvYWSRBwj0fvvnax1',
            'role' => 'admin'
        ]);

        $this->actingAs($admin);
    }

    private function base()
    {
        $spec = Specialization::create([
            'name' => 'Therapy',
            'description' => 'Test'
        ]);

        $doctorUser = User::create([
            'firebase_uid' => 'doc_admin',
            'role' => 'doctor'
        ]);

        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'M',
            'phone' => '123',
            'specialization_id' => $spec->id,
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

        Appointment::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'date' => now()->toDateString(),
            'time' => '10:00',
            'status' => 'expected'
        ]);

        DoctorSchedules::create([
            'doctor_id' => $doctor->id,
            'day_of_week' => now()->format('l'),
            'start_time' => '08:00:00',
            'end_time' => '18:00:00'
        ]);

        return compact('spec', 'doctor', 'patient');
    }

    public function test_dashboard_stats()
    {
        $this->base();

        $response = $this->getJson('/api/admin/view/dashboard-stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'doctors',
                    'patients',
                    'appointments_today',
                    'labs'
                ],
                'appointments_week',
                'patients_by_month',
                'top_doctors'
            ]);
    }


    public function test_get_specializations()
    {
        Specialization::create([
            'name' => 'Cardiology',
            'description' => 'Test'
        ]);

        $response = $this->getJson('/api/admin/view/specializations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'specializations'
            ]);
    }


    public function test_get_doctors()
    {
        $this->base();

        $response = $this->getJson('/api/admin/view/doctors');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'doctors'
            ]);
    }


    public function test_search_doctors()
    {
        $this->base();

        $response = $this->getJson('/api/admin/view/doctors?search=John');

        $response->assertStatus(200);
    }

    public function test_filter_doctors_by_specialization()
    {
        $data = $this->base();

        $response = $this->getJson(
            '/api/admin/view/doctors?specialization_id=' . $data['spec']->id
        );

        $response->assertStatus(200);
    }

    public function test_add_doctor()
    {
        $spec = Specialization::create([
            'name' => 'Test',
            'description' => 'Test'
        ]);

        $response = $this->postJson('/api/admin/control/doctors/add', [
            'firebase_uid' => 'new_doc_1',
            'first_name' => 'New',
            'last_name' => 'Doctor',
            'phone' => '555',
            'specialization_id' => $spec->id,
            'schedule' => [
                [
                    'day_of_week' => now()->format('l'),
                    'start_time' => '08:00:00',
                    'end_time' => '16:00:00'
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Лікаря створено'
            ]);
    }

    public function test_update_doctor()
    {
        $data = $this->base();

        $response = $this->putJson(
            '/api/admin/control/doctors/update/' . $data['doctor']->id,
            [
                'first_name' => 'Updated',
                'last_name' => 'Doctor',
                'middle_name' => null,
                'phone' => '777',
                'specialization_id' => $data['spec']->id,
                'schedule' => []
            ]
        );

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'first_name',
                'last_name'
            ]);
    }

    public function test_delete_doctor()
    {
        $data = $this->base();

        $response = $this->deleteJson(
            '/api/admin/control/doctors/delete/' . $data['doctor']->id
        );

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'deleted'
            ]);
    }
}
