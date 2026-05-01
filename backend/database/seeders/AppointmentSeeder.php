<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $patients = DB::table('patients')->get();
        $doctors = DB::table('doctors')->get();

        $services = DB::table('services')
            ->get()
            ->groupBy('specialization_id');

        $familyDoctorSpecId = DB::table('specializations')
            ->where('name', 'Сімейний лікар (Терапевт)')
            ->value('id');

        $familyDoctors = $doctors
            ->where('specialization_id', $familyDoctorSpecId)
            ->values();

        $specialDoctors = $doctors
            ->where('specialization_id', '!=', $familyDoctorSpecId)
            ->values();

        $statuses = ['expected', 'completed', 'cancelled', 'no_show'];

        foreach ($patients as $pIndex => $patient) {

            $usedDoctors = [];

            for ($i = 0; $i < 5; $i++) {

                // =========================
                //  ЛІКАР
                // =========================
                if ($i === 0) {

                    $doctor = $doctors->firstWhere('id', $patient->doctor_id);


                    if (!$doctor) {
                        $doctor = $familyDoctors[$pIndex % max(1, $familyDoctors->count())];
                    }
                } else {
                    do {
                        $doctor = $specialDoctors[rand(0, $specialDoctors->count() - 1)];
                    } while (in_array($doctor->id, $usedDoctors));

                    $usedDoctors[] = $doctor->id;
                }

                // =========================
                // ДАТА / ЧАС
                // =========================
                $date = now()->addDays(rand(1, 60))->format('Y-m-d');
                $time = sprintf('%02d:00:00', rand(8, 17));

                // =========================
                //  СТАТУС
                // =========================
                $status = $statuses[array_rand($statuses)];

                // =========================
                //  СТВОРЕННЯ ПРИЙОМУ
                // =========================
                $appointmentId = DB::table('appointments')->insertGetId([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'date' => $date,
                    'time' => $time,
                    'is_online' => 0,
                    'status' => $status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // =========================
                //  ПОСЛУГИ (ТІЛЬКИ СВОЇ)
                // =========================
                $doctorServices = $services[$doctor->specialization_id] ?? collect();

                if ($doctorServices->isNotEmpty()) {

                    $count = rand(1, min(2, $doctorServices->count()));

                    $selected = $doctorServices->random($count);

                    if (!($selected instanceof \Illuminate\Support\Collection)) {
                        $selected = collect([$selected]);
                    }

                    foreach ($selected as $service) {
                        DB::table('appointment_services')->insert([
                            'appointment_id' => $appointmentId,
                            'service_id' => $service->id,
                            'price' => $service->price,
                        ]);
                    }
                }
            }
        }
    }
}
