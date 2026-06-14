<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Specialization;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\DoctorSchedules;

class TestDatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. SPECIALIZATION
        $specialization = Specialization::create([
            'name' => 'Therapist',
            'description' => 'General practice'
        ]);

        // 2. DOCTOR USER
        $doctorUser = User::create([
            'firebase_uid' => 'doctor_uid',
            'role' => 'doctor'
        ]);

        // 3. DOCTOR
        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'specialization_id' => $specialization->id,
            'first_name' => 'Ivan',
            'last_name' => 'Petrenko',
            'middle_name' => 'Ivanovich',
            'phone' => '380991112244'
        ]);

        // 4. DOCTOR SCHEDULE (ВАЖЛИВО)
        DoctorSchedules::create([
            'doctor_id' => $doctor->id,
            'day_of_week' => 'Monday',
            'start_time' => '00:00',
            'end_time' => '23:59'
        ]);

        // 5. PATIENT USER
        $patientUser = User::create([
            'firebase_uid' => 'patient_uid',
            'role' => 'patient'
        ]);

        // 6. PATIENT
        Patient::create([
            'user_id' => $patientUser->id,
            'doctor_id' => $doctor->id,
            'first_name' => 'Test',
            'last_name' => 'User',
            'middle_name' => 'Test',
            'gender' => 'male',
            'address' => 'Test Address',
            'date_of_birth' => '2000-01-01',
            'phone' => '380991112233'
        ]);

        // 7. SERVICE (🔥 ОЦЕ ТИ ЗАБИВ)
        Service::create([
            'specialization_id' => $specialization->id,
            'name' => 'Consultation',
            'description' => 'Test service',
            'price' => 100,
            'type' => 'consultation'
        ]);
    }
}
