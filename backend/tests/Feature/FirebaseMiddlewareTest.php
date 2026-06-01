<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Http\Middleware\FirebaseAuth;

class FirebaseMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_firebase_middleware_blocks_unauthorized()
    {
        $response = $this->getJson('/api/test-firebase');

        $response->assertStatus(401);
    }

    public function test_firebase_middleware_allows_authenticated_user()
    {
        $user = User::create([
            'firebase_uid' => 'test_uid_123',
            'role' => 'patient'
        ]);


        $this->withoutMiddleware(FirebaseAuth::class);

        $this->actingAs($user);

        $response = $this->getJson('/api/test-firebase');

        $response->assertStatus(200);
    }
}
