<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')
            ->where('role', 'patient')
            ->pluck('id')
            ->values();


        $familyDoctors = DB::table('doctors')
            ->join('specializations', 'doctors.specialization_id', '=', 'specializations.id')
            ->where('specializations.name', 'Сімейний лікар (Терапевт)')
            ->pluck('doctors.id')
            ->values();

        $names = [
            ['Ковальчук', 'Андрій', 'Іванович'],
            ['Шевчук', 'Олена', 'Петрівна'],
            ['Бойко', 'Максим', 'Сергійович'],
            ['Тимошенко', 'Ірина', 'Олегівна'],
            ['Романюк', 'Дмитро', 'Вікторович'],
            ['Савчук', 'Наталія', 'Іванівна'],
            ['Мельничук', 'Олексій', 'Павлович'],
            ['Кравець', 'Вікторія', 'Андріївна'],
            ['Лисенко', 'Юрій', 'Миколайович'],
            ['Гаврилюк', 'Дарина', 'Сергіївна'],
        ];

        foreach ($users as $i => $userId) {

            $doctorId = $familyDoctors[$i % $familyDoctors->count()];

            [$last, $first, $middle] = $names[$i];

            DB::table('patients')->insert([
                'user_id' => $userId,
                'doctor_id' => $doctorId,

                'last_name' => $last,
                'first_name' => $first,
                'middle_name' => $middle,

                'gender' => $i % 2 ? 'male' : 'female',
                'address' => 'Kyiv, street ' . ($i + 1),
                'date_of_birth' => '199' . ($i % 10) . '-01-01',
                'phone' => '+38050111' . str_pad($i, 3, '0', STR_PAD_LEFT),

                'notes' => null,

                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
