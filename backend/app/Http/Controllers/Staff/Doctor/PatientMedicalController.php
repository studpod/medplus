<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Kreait\Firebase\Factory;
use App\Models\{Patient, Doctor, Appointment, MedicalRecord, AppointmentStatusLog};
use Illuminate\Support\Facades\Auth;

class PatientMedicalController extends Controller
{

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


        $appointmentsQuery = Appointment::with([
            'doctor.specialization',
            'medicalRecord',
            'appointmentServices.service',
            'appointmentServices.diagnosticReport.files',
        ])
            ->where('patient_id', $patientId);

        if (!$isFamilyDoctor) {
            $appointmentsQuery->where('doctor_id', $doctor->id);
        }

        $appointments = $appointmentsQuery
            ->orderBy('date', 'desc')
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


            'appointments' => $appointments
        ]);
    }
    public function addMedicalCard(Request $request, $patientId)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволений лише лікарям'], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->first();
        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдений'], 404);
        }

        $validated = $request->validate([
            'appointment_id'  => 'required|exists:appointments,id',
            'chief_complaint' => 'required|string',
            'initial_review' => 'required|string',
            'anamnesis'       => 'required|string',
            'diagnosis'       => 'required|string',
            'treatment'       => 'required|string',
            'prescriptions'   => 'nullable|string',
            'notes'           => 'nullable|string',
//            'start_date'      => 'nullable|date',
//            'end_date'        => 'nullable|date|after_or_equal:start_date',
        ]);

        $patient = Patient::find($patientId);
        if (!$patient) {
            return response()->json(['error' => 'Пацієнт не знайдений'], 404);
        }

        $appointment = Appointment::where('id', $validated['appointment_id'])
            ->where('patient_id', $patient->id)
            ->first();

        if (!$appointment) {
            return response()->json(['error' => 'Прийом не знайдено для цього пацієнта'], 404);
        }


//        if ($doctor->specialization->name === 'Сімейний лікар') {
//            if ($patient->doctor_id !== $doctor->id) {
//                return response()->json(['error' => 'Цей пацієнт не закріплений за вами'], 403);
//            }
//        } else {
//            if ($appointment->doctor_id !== $doctor->id) {
//                return response()->json(['error' => 'Ви не можете додавати записи до цього прийому'], 403);
//            }
//        }

        $existingRecord = MedicalRecord::where('appointment_id', $appointment->id)->first();
        if ($existingRecord) {
            return response()->json([
                'error' => 'Для цього прийому вже існує запис у медичній картці'
            ], 400);
        }


        $medicalRecord = MedicalRecord::create([
            'appointment_id' => $appointment->id,
            'chief_complaint' => $validated['chief_complaint'],
            'anamnesis' => $validated['anamnesis'] ?? null,
            'initial_review' => $validated['initial_review'],
            'diagnosis' => $validated['diagnosis'],
            'treatment' => $validated['treatment'],
            'prescriptions' => $validated['prescriptions'] ?? null,
            'notes' => $validated['notes'] ?? null,
//            'start_date' => $validated['start_date'] ?? now(),
//            'end_date' => $validated['end_date'] ?? null,
        ]);




        Cache::forget("doctor:{$doctor->id}:patient:{$patientId}:medical-card");
        Cache::forget("doctor:{$doctor->id}:appointments");

        return response()->json([
            'message' => 'Запис у медичну карту успішно створено, статус прийому оновлено',
            'medical_record' => $medicalRecord,
            'appointment' => $appointment,
            'logs' => $appointment->statusLogs()->with('user')->get()
        ], 201);
    }

    public function updateMedicalCard(Request $request, $patientId, $recordId)
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

        $record = MedicalRecord::with('appointment')->find($recordId);

        if (!$record) {
            return response()->json([
                'error' => 'Запис медичної карти не знайдений'
            ], 404);
        }

        if (!$record->appointment) {
            return response()->json([
                'error' => 'Прийом не знайдений'
            ], 404);
        }


        if ($record->appointment->doctor_id !== $doctor->id) {
            return response()->json([
                'error' => 'Ви можете редагувати лише власні записи'
            ], 403);
        }

        $validated = $request->validate([
            'chief_complaint' => 'required|string',
            'anamnesis'       => 'nullable|string',
            'initial_review'  => 'nullable|string',
            'diagnosis'       => 'required|string',
            'treatment'       => 'required|string',
            'prescriptions'   => 'nullable|string',
            'notes'           => 'nullable|string',
        ]);

        $record->update($validated);

        return response()->json([
            'message' => 'Запис медичної карти оновлено',
            'medical_record' => $record
        ]);
    }
}
