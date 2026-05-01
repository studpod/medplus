<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            // ================= DOCTORS =================
            ['firebase_uid' => 'FEik1jLcMJS7Vzr7tV9FKvRiMg23', 'role' => 'doctor'],
            ['firebase_uid' => 'FOgIt6dg7CZ6RuNQf5lzI8428wk2', 'role' => 'doctor'],
            ['firebase_uid' => 'HzSDoLOF4PMmEL1Q0jwgDHAS0qH3', 'role' => 'doctor'],
            ['firebase_uid' => 'Zr3LEKWtTNZKg2RPPpqkKG1mrhg2', 'role' => 'doctor'],
            ['firebase_uid' => 'B1hCBk7eeEVzxxYCi3VowWOVRiW2', 'role' => 'doctor'],
            ['firebase_uid' => '7UnLcV7njfYSoqaDEVrca3SZUan2', 'role' => 'doctor'],
            ['firebase_uid' => 'zysdJdcdroSfmrOq6CYkjKyHZ9E2', 'role' => 'doctor'],
            ['firebase_uid' => '1uRqtOHPlrgcsn5EFbzJwVjLOYo1', 'role' => 'doctor'],
            ['firebase_uid' => '6hfg5mwyW4MnVDhqbyYuT0YTYKG3', 'role' => 'doctor'],
            ['firebase_uid' => '4ED7kxTAcBfJLvRfNrqWlP7w0uJ2', 'role' => 'doctor'],
            ['firebase_uid' => '9FJtcA7jqZY2rJtHK4ckVIYIbh13', 'role' => 'doctor'],
            ['firebase_uid' => 'bEhRSDNonpXoTix1BfbtXklfkpr1', 'role' => 'doctor'],
            ['firebase_uid' => 'z6Dhm3jrs4eZqQxKHah8SogWBXI2', 'role' => 'doctor'],
            ['firebase_uid' => 'fgQzRdCa4LcXv3YhmKBjs55DxHN2', 'role' => 'doctor'],
            ['firebase_uid' => 'IMmnjDxVrrPUT83BDQZqVnZz2Bo2', 'role' => 'doctor'],
            ['firebase_uid' => '3QwrKwyePIabY2gwkx4ISYQrIXp2', 'role' => 'doctor'],
            ['firebase_uid' => '6S8BZNW6tIheoZRr34TEwBruYXi2', 'role' => 'doctor'],
            ['firebase_uid' => 'VqIKuGdZ2KbcULymSPorZhQQ26i1', 'role' => 'doctor'],
            ['firebase_uid' => 'PJduulpnoWdem5acs4BQUjTwdrF3', 'role' => 'doctor'],
            ['firebase_uid' => 'TBZ0O5FsJ0OdoOKzhC7ZjJJLEMr2', 'role' => 'doctor'],

            // ================= PATIENTS =================
            ['firebase_uid' => '8OVoTaqpzqa6KZABbtOVZ4QVhro2', 'role' => 'patient'],
            ['firebase_uid' => 'RpNfajAtFvXdK8czGAENN1XG85y2', 'role' => 'patient'],
            ['firebase_uid' => 'qZyelZ4UmqgQ3qTR1zopv3z13cn1', 'role' => 'patient'],
            ['firebase_uid' => 'iazYTymshkNd52p7ynqdKHwfwlR2', 'role' => 'patient'],
            ['firebase_uid' => 'xrtYUe8s3oSyuTf90tyfCeeEJP72', 'role' => 'patient'],
            ['firebase_uid' => 'L5x9yEwYbtVKQ8npWf96Khu3VRD2', 'role' => 'patient'],
            ['firebase_uid' => '72acIyOxAPfaweeu6myFEiup7iU2', 'role' => 'patient'],
            ['firebase_uid' => 'JteQMKL1SFVQzpqSYLHrgnn5nxY2', 'role' => 'patient'],
            ['firebase_uid' => 'bqc0R72kH3WXb3LE6FZQiur9lV42', 'role' => 'patient'],
            ['firebase_uid' => 'jDCziMuZ6uOZnXoTOa5LVlDKwxI2', 'role' => 'patient'],
        ]);
    }
}
