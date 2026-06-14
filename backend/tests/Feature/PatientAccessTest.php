<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Http\Middleware\FirebaseAuth;

class PatientAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_access_api()
    {
        $user = User::create([
            'firebase_uid' => 'patient_1',
            'role' => 'patient'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);

        $this->actingAs($user);

        $response = $this->getJson('/api/patient/view/profile');

        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_patient_api()
    {
        $response = $this->getJson('/api/patient/view/profile');

        $response->assertStatus(401);
    }
}
