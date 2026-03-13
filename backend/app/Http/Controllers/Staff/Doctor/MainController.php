<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\{Doctor, Patient, DoctorSchedules, MedicalRecord, Appointment, AppointmentStatusLog};


class MainController extends Controller
{
    public function calendar()
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        $appointments = \App\Models\Appointment::with([
            'patient',
            'services'
        ])
            ->where('doctor_id', $doctor->id)
            ->get();

        $events = $appointments->map(function ($appointment) {
            $patient = $appointment->patient;

            $patientName = trim(
                ($patient->last_name ?? '') . ' ' .
                ($patient->first_name ?? '') . ' ' .
                ($patient->middle_name ?? '')
            );

            $services = $appointment->services
                ->pluck('name')
                ->implode(', ');

            $start = \Carbon\Carbon::parse($appointment->date . ' ' . $appointment->time);
            $end = $start->copy()->addMinutes(30);

            return [
                "id" => $appointment->id,
                "patientId" => $patient->id,
                "title" => $patientName . ($services ? " — " . $services : ""),
                "start" => $start->toIso8601String(),
                "end" => $end->toIso8601String(),
                "status" => $appointment->status
            ];
        });

        $schedule = $doctor->schedules()->get()->map(function ($s) {
            return [
                "day_of_week" => $s->day_of_week,
                "start_time" => $s->start_time,
                "end_time" => $s->end_time
            ];
        });

        return response()->json([
            "events" => $events,
            "schedule" => $schedule
        ]);
    }
    public function viewSchedule(Request $request)
    {

        $user = auth()->user();


        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }


        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }


        $schedules = $doctor->schedules()
            ->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")
            ->get();

        return response()->json([
            'doctor_id' => $doctor->id,
            'schedule' => $schedules
        ]);
    }

    public function viewReception(Request $request)
    {

        $user = auth()->user();


        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }


        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }


        $receptions = Appointment::with([
            'patient',
            'statusLogs.user'
        ])
            ->where('doctor_id', $doctor->id)
            ->orderByRaw("FIELD(status, 'expected', 'completed', 'cancelled')")
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        return response()->json([
            'doctor_id' => $doctor->id,
            'receptions' => $receptions
        ]);
    }

    public function viewPatients(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }


        $cacheKey = "doctor_{$doctor->id}_patients";

        // Кеш на 10 хвилин
        $patients = Cache::remember($cacheKey, 600, function () use ($doctor) {
            return Patient::with('user') // додаємо інформацію про користувача (email, phone)
            ->where('doctor_id', $doctor->id)
                ->orderBy('last_name', 'asc')
                ->orderBy('first_name', 'asc')
                ->get();
        });

        return response()->json([
            'doctor_id' => $doctor->id,
            'patients' => $patients
        ]);
    }

    public function viewMedicalCard($patientId)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        $doctor = $user->doctor()->with('specialization')->first();
        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        $cacheKey = "doctor:{$doctor->id}:patient:{$patientId}:medical-card";


        $medicalCard = Cache::remember($cacheKey, 600, function () use ($patientId, $doctor) {

            $patient = Patient::where('id', $patientId)
                ->where('doctor_id', $doctor->id)
                ->firstOrFail();

            $medicalRecords = MedicalRecord::with([
                'appointment',
                'labsResults' => function($q) {
                    $q->orderBy('labNumber', 'asc');
                }
            ])
                ->whereHas('appointment', function($q) use ($patientId) {
                    $q->where('patient_id', $patientId);
                })
                ->orderBy('start_date', 'desc')
                ->get();

            Log::info("Medical card fetched from DB for patient {$patientId}");

            return [
                'patient' => [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'middle_name' => $patient->middle_name,
                    'date_of_birth' => $patient->date_of_birth,
                    'gender' => $patient->gender,
                    'phone' => $patient->phone,
                    'email' => $patient->user->email ?? null,
                    'address' => $patient->address,
                    'notes' => $patient->notes,

                    'family_doctor' => [
                        'first_name' => $doctor->first_name,
                        'last_name' => $doctor->last_name,
                        'middle_name' => $doctor->middle_name,
                        'specialization' => $doctor->specialization->name ?? null
                    ]
                ],

                'medical_records' => $medicalRecords
            ];
        });

        Log::info("Medical card returned from cache for patient {$patientId}");

        return response()->json($medicalCard);
    }
    public function getPatientAppointments($patientId)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'doctor') {
            return response()->json([
                'error' => 'Доступ дозволений лише лікарям'
            ], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json([
                'error' => 'Профіль лікаря не знайдений'
            ], 404);
        }

        $appointments = Appointment::with('doctor')
            ->where('patient_id', $patientId)
            ->where('doctor_id', $doctor->id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'appointments' => $appointments
        ]);
    }
    public function me()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'doctor') {
            return response()->json([
                'error' => 'Доступ дозволений лише лікарям'
            ], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json([
                'error' => 'Профіль лікаря не знайдений'
            ], 404);
        }

        return response()->json([
            'id' => $doctor->id,
            'first_name' => $doctor->first_name,
            'last_name' => $doctor->last_name,
            'specialization' => $doctor->specialization?->name
        ]);
    }
    public function updateStatusAppointment($appointmentId)
    {
        $appointment = Appointment::with('statusLogs')->find($appointmentId);

        if (!$appointment) {
            return response()->json(['error' => 'Прийом не знайдено'], 404);
        }


        $oldStatus = $appointment->status;
        $appointment->status = 'no_show';
        $appointment->save();

        // Створюємо лог
        $log = AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'old_status' => $oldStatus,
            'new_status' => 'no_show',
            'changed_by' => auth()->id()
        ]);


        $appointment->load('statusLogs.user');

        return response()->json([
            'message' => 'Статус оновлено',
            'logs' => $appointment->statusLogs
        ]);
    }
}
