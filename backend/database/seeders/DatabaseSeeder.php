<?php

namespace Database\Seeders;

use App\Models\DoctorSchedules;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
       $this->call([
//        RolesTableSeeder::class,
           UserSeeder::class,
           SpecializationSeeder::class,
           DoctorSeeder::class,
           PatientSeeder::class,
           ServiceSeeder::class,
           DoctorScheduleSeeder::class,
           AppointmentSeeder::class,
    ]);
    }
}
