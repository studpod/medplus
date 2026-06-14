<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class SyncAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created_from_firebase()
    {
        $response = $this->postJson('/api/auth/sync', [
            'uid' => 'firebase_uid_test_123',
            'email' => 'test@example.com',
            'phone' => '380991112233'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'firebase_uid' => 'firebase_uid_test_123',
            'role' => 'patient'
        ]);
    }

    public function test_sync_fails_without_uid()
    {
        $response = $this->postJson('/api/auth/sync', [
            'email' => 'test@example.com'
        ]);

        $response->assertStatus(400);
    }
}
