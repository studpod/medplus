<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $spec = DB::table('specializations')->pluck('id', 'name');

        DB::table('services')->insert([

            // =========================
            //  СІМЕЙНИЙ ЛІКАР
            // =========================
            [
                'specialization_id' => $spec['Сімейний лікар (Терапевт)'],
                'name' => 'Первинна консультація',
                'description' => 'Огляд, діагностика, направлення',
                'price' => 500,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Сімейний лікар (Терапевт)'],
                'name' => 'Повторна консультація',
                'description' => 'Контроль лікування',
                'price' => 350,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Сімейний лікар (Терапевт)'],
                'name' => 'Онлайн консультація',
                'description' => 'Дистанційний прийом лікаря',
                'price' => 400,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Сімейний лікар (Терапевт)'],
                'name' => 'Базовий чекап',
                'description' => 'Комплексне профілактичне обстеження',
                'price' => 1500,
                'type' => 'checkup',
            ],

            // =========================
            // КАРДІОЛОГ
            // =========================
            [
                'specialization_id' => $spec['Кардіолог'],
                'name' => 'Консультація кардіолога',
                'description' => 'Діагностика серця',
                'price' => 700,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Кардіолог'],
                'name' => 'ЕКГ',
                'description' => 'Електрокардіографія',
                'price' => 300,
                'type' => 'diagnostics',
            ],
            [
                'specialization_id' => $spec['Кардіолог'],
                'name' => 'Холтер-моніторинг',
                'description' => 'Добовий контроль серця',
                'price' => 1200,
                'type' => 'diagnostics',
            ],
            [
                'specialization_id' => $spec['Кардіолог'],
                'name' => 'Кардіологічний чекап',
                'description' => 'Повна перевірка серця',
                'price' => 2500,
                'type' => 'checkup',
            ],

            // =========================
            //  НЕВРОЛОГ
            // =========================
            [
                'specialization_id' => $spec['Невролог'],
                'name' => 'Консультація невролога',
                'description' => 'Оцінка нервової системи',
                'price' => 650,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Невролог'],
                'name' => 'ЕЕГ',
                'description' => 'Діагностика мозкової активності',
                'price' => 900,
                'type' => 'diagnostics',
            ],

            // =========================
            //  ДЕРМАТОЛОГ
            // =========================
            [
                'specialization_id' => $spec['Дерматолог'],
                'name' => 'Консультація дерматолога',
                'description' => 'Шкірні захворювання',
                'price' => 600,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Дерматолог'],
                'name' => 'Видалення папіломи',
                'description' => 'Мала хірургічна процедура',
                'price' => 500,
                'type' => 'procedure',
            ],
            [
                'specialization_id' => $spec['Дерматолог'],
                'name' => 'Дерматоскопія',
                'description' => 'Огляд шкірних утворень',
                'price' => 400,
                'type' => 'diagnostics',
            ],

            // =========================
            // ОФТАЛЬМОЛОГ
            // =========================
            [
                'specialization_id' => $spec['Офтальмолог'],
                'name' => 'Перевірка зору',
                'description' => 'Оцінка гостроти зору',
                'price' => 300,
                'type' => 'diagnostics',
            ],
            [
                'specialization_id' => $spec['Офтальмолог'],
                'name' => 'Консультація офтальмолога',
                'description' => 'Очні захворювання',
                'price' => 650,
                'type' => 'consultation',
            ],

            // =========================
            //ЛОР
            // =========================
            [
                'specialization_id' => $spec['Отоларинголог'],
                'name' => 'Консультація ЛОРа',
                'description' => 'Захворювання вуха, горла, носа',
                'price' => 600,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Отоларинголог'],
                'name' => 'Рентген грудної клітки',
                'description' => 'Діагностика легенів',
                'price' => 400,
                'type' => 'diagnostics',
            ],

            // =========================
            //  ГАСТРОЕНТЕРОЛОГ
            // =========================
            [
                'specialization_id' => $spec['Гастроентеролог'],
                'name' => 'Консультація гастроентеролога',
                'description' => 'ШКТ система',
                'price' => 700,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Гастроентеролог'],
                'name' => 'Гастроскопія (ФГДС)',
                'description' => 'Огляд шлунка',
                'price' => 1500,
                'type' => 'diagnostics',
            ],
            [
                'specialization_id' => $spec['Гастроентеролог'],
                'name' => 'Колоноскопія',
                'description' => 'Огляд кишківника',
                'price' => 2000,
                'type' => 'diagnostics',
            ],

            // =========================
            //  ЕНДОКРИНОЛОГ
            // =========================
            [
                'specialization_id' => $spec['Ендокринолог'],
                'name' => 'Консультація ендокринолога',
                'description' => 'Гормональні порушення',
                'price' => 700,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Ендокринолог'],
                'name' => 'Аналіз ТТГ',
                'description' => 'Щитоподібна залоза',
                'price' => 350,
                'type' => 'lab_test',
            ],
            [
                'specialization_id' => $spec['Ендокринолог'],
                'name' => 'Гормональний чекап',
                'description' => 'Комплекс гормонів',
                'price' => 1800,
                'type' => 'checkup',
            ],

            // =========================
            //  УРОЛОГ
            // =========================
            [
                'specialization_id' => $spec['Уролог'],
                'name' => 'Консультація уролога',
                'description' => 'Сечостатева система',
                'price' => 650,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Уролог'],
                'name' => 'УЗД нирок',
                'description' => 'Діагностика нирок',
                'price' => 500,
                'type' => 'diagnostics',
            ],

            // =========================
            //  ХІРУРГ
            // =========================
            [
                'specialization_id' => $spec['Хірург'],
                'name' => 'Консультація хірурга',
                'description' => 'Оперативна консультація',
                'price' => 800,
                'type' => 'consultation',
            ],
            [
                'specialization_id' => $spec['Хірург'],
                'name' => 'Видалення новоутворень',
                'description' => 'Мала хірургія',
                'price' => 1200,
                'type' => 'procedure',
            ],
        ]);
    }
}
