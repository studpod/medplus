<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Http\Middleware\FirebaseAuth;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_doctor_role_can_access()
    {
        $user = User::create([
            'firebase_uid' => 'doc_role',
            'role' => 'doctor'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);
        $this->actingAs($user);

        $response = $this->getJson('/api/doctor/view/me');

        $this->assertTrue(in_array($response->status(), [200, 404]));
    }

    public function test_patient_role_blocked_from_doctor_routes()
    {
        $user = User::create([
            'firebase_uid' => 'pat_block',
            'role' => 'patient'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);
        $this->actingAs($user);

        $response = $this->getJson('/api/doctor/view/me');

        $response->assertStatus(403);
    }
}
