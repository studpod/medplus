<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Service;
use App\Http\Middleware\FirebaseAuth;

class CreateAppointmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_create_appointment()
    {

        $this->seed(\Database\Seeders\TestDatabaseSeeder::class);


        $user = User::where('firebase_uid', 'patient_uid')->first();
        $this->assertNotNull($user);


        $doctor = Doctor::first();
        $this->assertNotNull($doctor);


        $service = Service::query()->first();

        if (!$service) {
            $this->fail('Service is missing in database. Seeder problem.');
        }


        $this->withoutMiddleware([
            FirebaseAuth::class,
            'role:patient'
        ]);

        $this->actingAs($user);


        $date = now()->next('Monday')->format('Y-m-d');

        $response = $this->postJson('/api/patient/control/reception/add', [
            'doctor_id' => $doctor->id,
            'service_ids' => [$service->id],
            'date' => $date,
            'time' => '10:00'
        ]);


        if ($response->status() !== 201) {
            dump($response->json());
        }


        $response->assertStatus(201);
    }
}
