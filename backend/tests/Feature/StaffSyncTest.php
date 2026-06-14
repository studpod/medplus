<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Http\Middleware\FirebaseAuth;

class StaffSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_access_staff_sync()
    {
        $user = User::create([
            'firebase_uid' => 'doctor_uid',
            'role' => 'doctor'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);

        $this->actingAs($user);

        $response = $this->postJson('/api/staff/sync');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'role' => 'doctor'
            ]);
    }

    public function test_non_staff_cannot_access_staff_sync()
    {
        $user = User::create([
            'firebase_uid' => 'patient_uid',
            'role' => 'patient'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);

        $this->actingAs($user);

        $response = $this->postJson('/api/staff/sync');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_staff_sync()
    {
        $response = $this->postJson('/api/staff/sync');

        $response->assertStatus(401);
    }
}
