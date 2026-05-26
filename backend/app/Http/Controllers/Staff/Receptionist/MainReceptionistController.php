<?php

namespace App\Http\Controllers\Staff\Receptionist;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Patient, Appointment, Doctor , Specialization, DoctorSchedules, Service,User};
use Carbon\Carbon;
class MainReceptionistController extends Controller
{
    public function calendar(Request $request)
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | DOCTOR ID
        |--------------------------------------------------------------------------
        */

        if ($user->role === 'doctor') {

            $doctor = Doctor::where(
                'user_id',
                $user->id
            )->first();

            if (!$doctor) {
                return response()->json([
                    'error' => 'Лікаря не знайдено'
                ], 404);
            }

            $doctorId = $doctor->id;
        }

        /*
        |--------------------------------------------------------------------------
        | RECEPTIONIST
        |--------------------------------------------------------------------------
        */

        elseif ($user->role === 'receptionist') {

            $doctorId = $request->doctor_id;

            if (!$doctorId) {
                return response()->json([
                    'events' => [],
                    'schedule' => []
                ]);
            }
        }

        else {
            return response()->json([
                'error' => 'Access denied'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | APPOINTMENTS
        |--------------------------------------------------------------------------
        */

        $appointments = Appointment::with([
            'patient',
            'appointmentServices.service'
        ])
            ->where('doctor_id', $doctorId)
            ->get();

        $events = [];

        foreach ($appointments as $appointment) {

            $serviceNames = $appointment->appointmentServices
                ->pluck('service.name')
                ->implode(', ');

            $title =
                $appointment->patient->last_name . ' ' .
                $appointment->patient->first_name .
                ' — ' .
                $serviceNames;

            $start = $appointment->date . ' ' . $appointment->time;

            $end = date(
                'Y-m-d H:i:s',
                strtotime($start . ' +30 minutes')
            );

            $events[] = [
                'id' => $appointment->id,

                'title' => $title,

                'start' => $start,

                'end' => $end,

                'patientId' => $appointment->patient->id
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | SCHEDULE
        |--------------------------------------------------------------------------
        */

        $schedule = DoctorSchedules::where(
            'doctor_id',
            $doctorId
        )->get();

        return response()->json([
            'events' => $events,
            'schedule' => $schedule
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SPECIALIZATIONS
    |--------------------------------------------------------------------------
    */

    public function specializations()
    {
        return response()->json(
            Specialization::orderBy('name')->get()
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DOCTORS
    |--------------------------------------------------------------------------
    */

    public function doctorsBySpecialization($id)
    {
        $doctors = Doctor::with('specialization')
            ->where('specialization_id', $id)
            ->get();

        return response()->json($doctors);
    }
    public function patients()
    {
        return Patient::with('doctor')
            ->orderBy('last_name')
            ->get()
            ->map(function ($p) {

                return [
                    'id' => $p->id,
                    'doctor_id' => $p->doctor_id,

                    'last_name' => $p->last_name,
                    'first_name' => $p->first_name,
                    'middle_name' => $p->middle_name,
                    'gender' => $p->gender,

                    'phone' => $p->phone,
                    'address' => $p->address,
                    'date_of_birth' => $p->date_of_birth,
                    'notes' => $p->notes,


                    'doctor_full_name' => $p->doctor
                        ? trim($p->doctor->last_name . ' ' . $p->doctor->first_name . ' ' . ($p->doctor->middle_name ?? ''))
                        : null,

                    'doctor' => $p->doctor
                ];
            });
    }

    public function searchPatients(Request $request)
    {
        $query = $request->get('q');

        if (!$query || strlen($query) < 3) {
            return response()->json([]);
        }

        $patients = Patient::with('doctor')
            ->select(
                'id',
                'doctor_id',
                'last_name',
                'first_name',
                'middle_name',
                'gender',
                'phone',
                'address',
                'date_of_birth',
                'notes'
            )
            ->where('last_name', 'like', "%{$query}%")
            ->orderBy('last_name')
            ->limit(10)
            ->get()
            ->map(function ($p) {

                return [
                    'id' => $p->id,
                    'doctor_id' => $p->doctor_id,

                    'last_name' => $p->last_name,
                    'first_name' => $p->first_name,
                    'middle_name' => $p->middle_name,
                    'gender' => $p->gender,

                    'phone' => $p->phone,
                    'address' => $p->address,
                    'date_of_birth' => $p->date_of_birth,
                    'notes' => $p->notes,

                    'doctor_full_name' => $p->doctor
                        ? trim(
                            $p->doctor->last_name . ' ' .
                            $p->doctor->first_name . ' ' .
                            ($p->doctor->middle_name ?? '')
                        )
                        : null,

                    'doctor' => $p->doctor
                ];
            });

        return response()->json($patients);
    }
    /*
    |--------------------------------------------------------------------------
    | SPECIALIZATIONS
    |--------------------------------------------------------------------------
    */


    /*
    |--------------------------------------------------------------------------
    | SERVICES BY DOCTOR
    |--------------------------------------------------------------------------
    */

    public function servicesByDoctor($id)
    {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([]);
        }

        return Service::where(
            'specialization_id',
            $doctor->specialization_id
        )
            ->select(
                'id',
                'name',
                'price'
            )
            ->get();
    }


    public function doctorAvailableTimes(Request $request)
    {
        $doctorId = $request->doctor_id;
        $date = $request->date;
        $excludeId = $request->exclude_appointment_id;

        if (!$doctorId || !$date) {
            return response()->json([]);
        }

        $dayOfWeek = Carbon::parse($date)->format('l');

        $schedule = DoctorSchedules::where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if (!$schedule) {
            return response()->json([]);
        }


        $appointmentsQuery = Appointment::where('doctor_id', $doctorId)
            ->where('date', $date);

        if ($excludeId) {
            $appointmentsQuery->where('id', '!=', $excludeId);
        }

        $appointments = $appointmentsQuery
            ->pluck('time')
            ->map(fn($t) => substr($t, 0, 5))
            ->toArray();

        $times = [];

        $start = Carbon::createFromFormat('H:i:s', $schedule->start_time);
        $end = Carbon::createFromFormat('H:i:s', $schedule->end_time);

        while ($start < $end) {

            $time = $start->format('H:i');

            if (!in_array($time, $appointments)) {
                $times[] = $time;
            }

            $start->addMinutes(30);
        }

        return response()->json($times);
    }
    public function getDoctors()
    {
        $doctors = Doctor::with('specialization')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'full_name' => trim(
                        $doctor->last_name . ' ' .
                        $doctor->first_name . ' ' .
                        $doctor->middle_name
                    ),
                    'specialization' => $doctor->specialization?->name ?? '—',
                ];
            });

        return response()->json([
            'doctors' => $doctors
        ]);
    }
    public function getPatients()
    {
        try {

            $patients = Patient::with([
                'doctor.specialization'
            ])
                ->orderBy('last_name')
                ->get()
                ->map(function ($patient) {

                    return [

                        'id' => $patient->id,

                        'full_name' =>
                            trim(
                                $patient->last_name . ' ' .
                                $patient->first_name . ' ' .
                                $patient->middle_name
                            ),

                        'last_name' => $patient->last_name,
                        'first_name' => $patient->first_name,
                        'middle_name' => $patient->middle_name,

                        'gender' => $patient->gender,

                        'date_of_birth' => $patient->date_of_birth,

                        'phone' => $patient->phone,

                        'address' => $patient->address,

                        'notes' => $patient->notes,

                        'has_account' => !is_null($patient->user_id),

                        'family_doctor' => $patient->doctor
                            ? trim(
                                $patient->doctor->last_name . ' ' .
                                $patient->doctor->first_name . ' ' .
                                $patient->doctor->middle_name
                            )
                            : null,

                        'doctor_specialization' =>
                            $patient->doctor?->specialization?->name,
                    ];
                });

            return response()->json($patients);

        } catch (\Exception $e) {

            \Log::error($e->getMessage());

            return response()->json([
                'error' => 'Помилка сервера'
            ], 500);
        }
    }

    public function updatePatient(Request $request, $id)
    {
        try {

            $patient = Patient::find($id);

            if (!$patient) {

                return response()->json([
                    'error' => 'Пацієнта не знайдено'
                ], 404);
            }

            // якщо є аккаунт — забороняємо редагування
            if ($patient->user_id) {

                return response()->json([
                    'error' => 'Не можна редагувати пацієнта з аккаунтом'
                ], 403);
            }

            $validated = $request->validate([

                'last_name' => 'required|string|max:255',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',

                'gender' => 'required|in:male,female',

                'address' => 'required|string|max:255',

                'date_of_birth' => 'required|date',

                'phone' => 'required|string|max:30',

                'notes' => 'nullable|string',
            ]);

            $patient->update($validated);

            return response()->json([
                'message' => 'Пацієнта оновлено'
            ]);

        } catch (\Exception $e) {

            \Log::error($e->getMessage());

            return response()->json([
                'error' => 'Помилка сервера'
            ], 500);
        }
    }
}
