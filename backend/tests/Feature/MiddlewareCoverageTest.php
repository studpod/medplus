<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Http\Middleware\FirebaseAuth;

class MiddlewareCoverageTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_access_is_blocked()
    {
        $response = $this->getJson('/api/patient/view/profile');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_passes()
    {
        $user = User::create([
            'firebase_uid' => 'test_uid',
            'role' => 'patient'
        ]);

        $this->withoutMiddleware(FirebaseAuth::class);

        $this->actingAs($user);

        $response = $this->getJson('/api/patient/view/profile');

        $response->assertStatus(200);
    }
}
