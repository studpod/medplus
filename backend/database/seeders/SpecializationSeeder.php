<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('specializations')->insert([
            ['name' => 'Сімейний лікар (Терапевт)', 'description' => 'Первинна медична допомога та базова діагностика'],
            ['name' => 'Кардіолог', 'description' => 'Серце та судини'],
            ['name' => 'Невролог', 'description' => 'Нервова система'],
            ['name' => 'Дерматолог', 'description' => 'Шкіра'],
            ['name' => 'Офтальмолог', 'description' => 'Зір та очі'],
            ['name' => 'Отоларинголог', 'description' => 'ЛОР органи'],
            ['name' => 'Гастроентеролог', 'description' => 'Травна система'],
            ['name' => 'Ендокринолог', 'description' => 'Гормони та метаболізм'],
            ['name' => 'Уролог', 'description' => 'Сечостатева система'],
            ['name' => 'Хірург', 'description' => 'Оперативна медицина'],
        ]);
    }
}
