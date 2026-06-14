<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiErrorTest extends TestCase
{
    use RefreshDatabase;

    public function test_404_on_wrong_route()
    {
        $response = $this->getJson('/api/doctor/unknown-route');

        $response->assertStatus(404);
    }

    public function test_unauthorized_access()
    {
        $response = $this->getJson('/api/patient/view/profile');

        $response->assertStatus(401);
    }
}
