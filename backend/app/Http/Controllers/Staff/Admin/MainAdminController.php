<?php

namespace App\Http\Controllers\Staff\Admin;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabsResult;
use App\Models\Specialization;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MainAdminController extends Controller
{
    public function dashboardStats()
    {
        /*
        |--------------------------------------------------------------------------
        | BASIC STATS
        |--------------------------------------------------------------------------
        */

        $doctorsCount = Doctor::count();

        $patientsCount = Patient::count();

        $appointmentsToday = Appointment::whereDate(
            'date',
            now()->toDateString()
        )->count();

        $labsCount = LabsResult::count();

        /*
        |--------------------------------------------------------------------------
        | APPOINTMENTS WEEK CHART
        |--------------------------------------------------------------------------
        */

        $appointmentsWeek = collect([
            'Пн',
            'Вт',
            'Ср',
            'Чт',
            'Пт',
            'Сб',
            'Нд'
        ])->map(function ($day, $index) {

            $date = now()
                ->startOfWeek()
                ->addDays($index);

            return [
                'day' => $day,

                'appointments' => Appointment::whereDate(
                    'date',
                    $date
                )->count()
            ];
        });

        /*
        |--------------------------------------------------------------------------
        | NEW PATIENTS CHART
        |--------------------------------------------------------------------------
        */

        $patientsByMonth = [];

        for ($i = 1; $i <= 12; $i++) {

            $patientsByMonth[] = [
                'month' => mb_substr(
                    now()->month($i)->translatedFormat('F'),
                    0,
                    3
                ),

                'patients' => Patient::whereMonth(
                    'created_at',
                    $i
                )->whereYear(
                    'created_at',
                    now()->year
                )->count()
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | TOP DOCTORS
        |--------------------------------------------------------------------------
        */

        $topDoctors = Doctor::query()
            ->select(
                'doctors.id',
                'doctors.first_name',
                'doctors.last_name',
                DB::raw('COUNT(appointments.id) as appointments_count')
            )
            ->leftJoin(
                'appointments',
                'appointments.doctor_id',
                '=',
                'doctors.id'
            )
            ->groupBy(
                'doctors.id',
                'doctors.first_name',
                'doctors.last_name'
            )
            ->orderByDesc('appointments_count')
            ->limit(5)
            ->get();

        return response()->json([

            'stats' => [
                'doctors' => $doctorsCount,
                'patients' => $patientsCount,
                'appointments_today' => $appointmentsToday,
                'labs' => $labsCount
            ],

            'appointments_week' => $appointmentsWeek,

            'patients_by_month' => $patientsByMonth,

            'top_doctors' => $topDoctors

        ]);
    }
    public function getSpecializations()
    {
        return response()->json([
            'specializations' => Specialization::all()
        ]);
    }
}
