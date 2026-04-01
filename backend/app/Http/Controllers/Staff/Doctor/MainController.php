<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Kreait\Firebase\Factory;
use App\Models\{Doctor, Patient, DoctorSchedules,
    MedicalRecord, Appointment, AppointmentService, AppointmentStatusLog,VideoCall, Referral,Specialization,
    LabsResult, LabsFile, Service,};


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
            'statusLogs.user',
            'appointmentServices.service'
        ])
            ->where('doctor_id', $doctor->id)


            ->where('is_online', false)

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

        // ❗ ВАЖНО: проверь правильное поле
        $isFamilyDoctor = $doctor->specialization && $doctor->specialization->name === 'Сімейни лікар';

        $query = Patient::query();

        if ($isFamilyDoctor) {
            // 🔹 семейный врач — только свои пациенты
            $patients = $query
                ->with('user')
                ->where('doctor_id', $doctor->id)
                ->orderBy('last_name', 'asc')
                ->orderBy('first_name', 'asc')
                ->get();
        } else {
            // 🔹 узкий специалист — ограниченные данные
            $patients = $query
                ->select('id', 'first_name', 'last_name', 'middle_name', 'date_of_birth')
                ->orderBy('last_name', 'asc')
                ->orderBy('first_name', 'asc')
                ->get();
        }

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

        $patient = Patient::with(['user', 'doctor.specialization'])->findOrFail($patientId);


        $isFamilyDoctor = $patient->doctor_id === $doctor->id;

        $hasAppointment = Appointment::where('patient_id', $patientId)
            ->where('doctor_id', $doctor->id)
            ->exists();

        if (!$isFamilyDoctor && !$hasAppointment) {
            return response()->json(['error' => 'Немає доступу до цього пацієнта'], 403);
        }
        $email = null;

        if ($patient->user && $patient->user->firebase_uid) {
            try {
                $factory = (new Factory)
                    ->withServiceAccount(storage_path('/firebase/medplus-auth-fb352-firebase-adminsdk-fbsvc-9dc637fc58.json'));

                $auth = $factory->createAuth();

                $firebaseUser = $auth->getUser($patient->user->firebase_uid);

                $email = $firebaseUser->email;
            } catch (\Exception $e) {
                \Log::error("Firebase error: " . $e->getMessage());
            }
        }

        $medicalRecordsQuery = MedicalRecord::with([
            'appointment.doctor.specialization',
            'labsResults' => function ($q) {
                $q->orderBy('labNumber', 'asc');
            }
        ])
            ->whereHas('appointment', function ($q) use ($patientId) {
                $q->where('patient_id', $patientId);
            });

        if (!$isFamilyDoctor) {
            $medicalRecordsQuery->whereHas('appointment', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            });
        }

        $medicalRecords = $medicalRecordsQuery
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json([
            'patient' => [
                'id' => $patient->id,
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'middle_name' => $patient->middle_name,
                'date_of_birth' => $patient->date_of_birth,
                'gender' => $patient->gender,
                'phone' => $patient->phone,
                'email' => $email,
                'address' => $patient->address,
                'notes' => $patient->notes,

                'family_doctor' => $patient->doctor ? [
                    'first_name' => $patient->doctor->first_name,
                    'last_name' => $patient->doctor->last_name,
                    'middle_name' => $patient->doctor->middle_name,
                    'specialization' => $patient->doctor->specialization->name ?? null
                ] : null
            ],

            'medical_records' => $medicalRecords
        ]);
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

        $doctor = Doctor::with('specialization') // 🔥 ВАЖЛИВО
        ->where('user_id', $user->id)
            ->first();

        if (!$doctor) {
            return response()->json([
                'error' => 'Профіль лікаря не знайдений'
            ], 404);
        }

        return response()->json([
            'user' => $user,
            'doctor' => $doctor
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

        //  лог
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

    public function viewOnlineAppointments()
    {
        $user = Auth::user();


        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json([
                'error' => 'Лікаря не знайдено'
            ], 404);
        }


        $appointments = Appointment::with('patient')
            ->where('doctor_id', $doctor->id)
            ->where('is_online', true)
            ->orderBy('date')
            ->orderBy('time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' =>
                        $appointment->patient->last_name . ' ' .
                        $appointment->patient->first_name . ' ' .
                        $appointment->patient->middle_name,

                    'date' => $appointment->date,
                    'time' => $appointment->time,
                    'status' => $appointment->status
                ];
            });

        return response()->json([
            'appointments' => $appointments
        ]);
    }


    public function startVideoCall(Request $request)
    {
        $user = auth()->user();
        $doctor = $user->doctor;

        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id'
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);

        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        if (!$appointment->is_online) {
            return response()->json(['error' => 'Not online appointment'], 400);
        }

        $existingCall = VideoCall::where('appointment_id', $appointment->id)
            ->whereIn('status', ['waiting', 'active'])
            ->first();

        if ($existingCall) {
            return response()->json([
                'room_id' => $existingCall->room_id
            ]);
        }
        $roomId = 'call_' . rand(100000, 999999);

        VideoCall::create([
            'appointment_id' => $appointment->id,
            'room_id' => $roomId,
            'status' => 'waiting'
        ]);

        return response()->json([
            'room_id' => $roomId
        ]);
    }
    public function endVideoCall(Request $request)
    {
        $request->validate([
            'room_id' => 'required|string|exists:video_calls,room_id'
        ]);

        $videoCall = VideoCall::where('room_id', $request->room_id)->firstOrFail();
        $appointment = $videoCall->appointment;

        $videoCall->status = 'ended';
        $videoCall->save();


        AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'old_status' => $appointment->status,
            'new_status' => 'completed',
            'changed_by' => auth()->id()
        ]);


        $appointment->status = 'completed';
        $appointment->save();

        return response()->json([
            'message' => 'Онлайн консультація завершена, статусы обновлены'
        ]);
    }
    public function addReferral(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Тільки лікар може створювати направлення'], 403);
        }

        $doctor = $user->doctor()->with('specialization')->first();

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        // 🔥 ПЕРЕВІРКА: тільки сімейний лікар
        if (!$doctor->specialization || $doctor->specialization->name !== 'Сімейний лікар') {
            return response()->json([
                'error' => 'Тільки сімейний лікар може створювати направлення'
            ], 403);
        }

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'to_specialization_id' => 'required|exists:specializations,id',
            'reason' => 'nullable|string'
        ]);

        $referral = Referral::create([
            'from_doctor_id'       => $doctor->id,
            'patient_id'           => $validated['patient_id'],
            'to_specialization_id' => $validated['to_specialization_id'],
            'reason'               => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Направлення створено',
            'referral' => $referral
        ]);
    }
    public function getPatientReferrals($patientId)
    {
        $referrals = Referral::with('specialization')
            ->where('patient_id', $patientId)
            ->latest()
            ->get();

        return response()->json($referrals);
    }




    public function getSpecializations()
    {
        $specializations = Specialization::select('id', 'name')->get();

        return response()->json($specializations);
    }

    public function getDoctorProfile()
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Не лікар'], 403);
        }

        $doctor = $user->doctor()->with('specialization')->first();

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        return response()->json([
            'id' => $doctor->id,
            'specialization' => $doctor->specialization->name
        ]);
    }
    public function getAppointment($id)
    {
        $appointment = Appointment::with([
            'patient',
            'doctor',
            'appointmentServices.service',
            'appointmentServices.labsResults.labsFiles',
            'medicalRecord'
        ])->findOrFail($id);

        return response()->json([
            'appointment' => $appointment
        ]);
    }

//    public function storeForAppointment(Request $request, $appointmentId)
//    {
//        $appointment = Appointment::with('appointmentServices')->findOrFail($appointmentId);
//
//        foreach ($appointment->appointmentServices as $service) {
//            if ($service->service->type === 'consultation') {
//
//                $record = MedicalRecord::updateOrCreate(
//                    [
//                        'appointment_service_id' => $service->id
//                    ],
//                    [
//                        'chief_complaint' => $request->chief_complaint,
//                        'initial_review' => $request->initial_review,
//                        'anamnesis' => $request->anamnesis,
//                        'diagnosis' => $request->diagnosis,
//                        'treatment' => $request->treatment,
//                        'prescriptions' => $request->prescriptions,
//                        'notes' => $request->notes,
//                    ]
//                );
//            }
//        }
//
//        return response()->json([
//            'success' => true
//        ]);
//    }
    public function getAppointmentService($id)
    {
        $appointmentService = AppointmentService::with([
            'service',
            'appointment.patient'
        ])->findOrFail($id);

        return response()->json($appointmentService);
    }
    public function getLabTest(Request $request)
    {
        $user = auth()->user();

        // 🔹 проверка роли
        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ тільки для лікарів'], 403);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        // 🔹 получаем специализацию врача
        $specializationId = $doctor->specialization_id;

        // 🔹 получаем только lab_test услуги этой специализации
        $services = Service::where('type', 'lab_test')
            ->where('specialization_id', $specializationId)
            ->get();

        return response()->json([
            'doctor_id' => $doctor->id,
            'services' => $services
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'appointment_service_id' => 'required|exists:appointment_services,id',
            'labNumber' => 'required|integer',
            'files.*' => 'nullable|file'
        ]);

        $lab = LabsResult::create([
            'appointment_service_id' => $validated['appointment_service_id'],
            'labNumber' => $validated['labNumber'],
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('labs');

                LabsFile::create([
                    'lab_id' => $lab->id,
                    'file_path' => $path,
                    'file_type' => $file->getClientMimeType()
                ]);
            }
        }

        return response()->json([
            'message' => 'Аналіз створено',
            'lab' => $lab
        ]);
    }
    public function getAppointmentServicesByPatient($patientId)
    {
        $services = AppointmentService::with(['service', 'appointment'])
            ->whereHas('appointment', function ($query) use ($patientId) {
                $query->where('patient_id', $patientId);
            })
            ->whereHas('service', function ($query) {
                $query->where('type', 'lab_test');
            })
            // ❗ исключаем уже созданные анализы
            ->whereDoesntHave('labsResults')
            ->get();

        return response()->json([
            'services' => $services
        ]);
    }

}
