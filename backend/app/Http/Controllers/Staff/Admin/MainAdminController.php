<?php

namespace App\Http\Controllers\Staff\Admin;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabsResult;
use App\Models\Specialization;
use App\Models\Service;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MainAdminController extends Controller
{
    public function dashboardStats()
    {
        /*
        |--------------------------------------------------------------------------
        | BASE STATS (ЧІТКІ KPI)
        |--------------------------------------------------------------------------
        */

        $doctorsCount = Doctor::count();

        $patientsCount = Patient::count();

        $appointmentsToday = Appointment::whereDate(
            'date',
            now()->toDateString()
        )
            ->where('status', '!=', 'cancelled')
            ->count();

        $completedAppointments = Appointment::where('status', 'completed')->count();

        $labsCount = LabsResult::count();

        /*
        |--------------------------------------------------------------------------
        | WEEK APPOINTMENTS (ТОЛЬКО АКТУАЛЬНІ)
        |--------------------------------------------------------------------------
        */

        $appointmentsWeek = collect([
            'Пн','Вт','Ср','Чт','Пт','Сб','Нд'
        ])->map(function ($day, $index) {

            $date = now()->startOfWeek()->addDays($index)->toDateString();

            return [
                'day' => $day,
                'appointments' => Appointment::whereDate('date', $date)
                    ->where('status', '!=', 'cancelled')
                    ->count()
            ];
        });

        /*
        |--------------------------------------------------------------------------
        | NEW PATIENTS (ПРАВИЛЬНИЙ РІК)
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

                'patients' => Patient::whereMonth('created_at', $i)
                    ->whereYear('created_at', now()->year)
                    ->count()
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | TOP DOCTORS (ТІЛЬКИ COMPLETED)
        |--------------------------------------------------------------------------
        */

        $topDoctors = Doctor::query()
            ->select(
                'doctors.id',
                'doctors.first_name',
                'doctors.last_name',
                DB::raw("COUNT(CASE WHEN appointments.status = 'completed' THEN 1 END) as completed_appointments")
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
            ->orderByDesc('completed_appointments')
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | LABS (ПО МІСЯЦЮ, А НЕ ВСІ)
        |--------------------------------------------------------------------------
        */

        $labsThisMonth = LabsResult::whereMonth(
            'created_at',
            now()->month
        )->count();

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'stats' => [
                'doctors' => $doctorsCount,
                'patients' => $patientsCount,
                'appointments_today' => $appointmentsToday,
                'appointments_completed' => $completedAppointments,
                'labs' => $labsCount,
                'labs_this_month' => $labsThisMonth
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

    public function getServices(Request $request)
    {
        $query = Service::with('specialization');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        return response()->json([
            'services' => $query->get()
        ]);
    }
    public function addService(Request $request)
    {
        $validated = $request->validate([
            'specialization_id' => 'required|exists:specializations,id',
            'name' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'type' => 'required|in:consultation,lab_test,procedure,checkup,diagnostics',
        ]);

        $service = Service::create($validated);

        return response()->json([
            'message' => 'Service created',
            'service' => $service
        ]);
    }
    public function updateService(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'specialization_id' => 'required|exists:specializations,id',
            'name' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'type' => 'required|in:consultation,lab_test,procedure,checkup,diagnostics',
        ]);

        $service->update($validated);

        return response()->json($service);
    }
    public function deleteService($id)
    {
        Service::findOrFail($id)->delete();

        return response()->json([
            'message' => 'deleted'
        ]);
    }
}
