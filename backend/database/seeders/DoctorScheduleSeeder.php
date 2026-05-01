<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class DoctorScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $doctors = DB::table('doctors')->get();

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        foreach ($doctors as $doctor) {
            foreach ($days as $day) {

                if ($day === 'Monday') {
                    DB::table('doctor_schedules')->insert([
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $day,
                            'start_time' => '08:00',
                            'end_time' => '17:00',
                        ],
                    ]);
                }

                if ($day === 'Tuesday') {
                    DB::table('doctor_schedules')->insert([
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $day,
                            'start_time' => '08:00',
                            'end_time' => '10:00',
                        ],
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $day,
                            'start_time' => '15:00',
                            'end_time' => '17:00',
                        ],
                    ]);
                }

                if ($day === 'Wednesday') {
                    DB::table('doctor_schedules')->insert([
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $day,
                            'start_time' => '13:00',
                            'end_time' => '17:00',
                        ],
                    ]);
                }

                if ($day === 'Thursday') {
                    DB::table('doctor_schedules')->insert([
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $day,
                            'start_time' => '09:00',
                            'end_time' => '12:00',
                        ],
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $day,
                            'start_time' => '14:00',
                            'end_time' => '18:00',
                        ],
                    ]);
                }

                if ($day === 'Friday') {
                    DB::table('doctor_schedules')->insert([
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $day,
                            'start_time' => '08:00',
                            'end_time' => '14:00',
                        ],
                    ]);
                }
            }
        }
    }
}
