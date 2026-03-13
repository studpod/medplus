<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\{Patient, Doctor, Appointment, MedicalRecord, AppointmentStatusLog};
use Illuminate\Support\Facades\Auth;

class PatientMedicalController extends Controller
{
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
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
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


        if ($doctor->specialization->name === 'Сімейний лікар') {
            if ($patient->doctor_id !== $doctor->id) {
                return response()->json(['error' => 'Цей пацієнт не закріплений за вами'], 403);
            }
        } else {
            if ($appointment->doctor_id !== $doctor->id) {
                return response()->json(['error' => 'Ви не можете додавати записи до цього прийому'], 403);
            }
        }

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
            'start_date' => $validated['start_date'] ?? now(),
            'end_date' => $validated['end_date'] ?? null,
        ]);

        // --------------- оновлення статус прийому ---------------
        $oldStatus = $appointment->status;
        $appointment->status = 'closed';
        $appointment->save();


        AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'old_status'     => $oldStatus,
            'new_status'     => 'closed',
            'changed_by'     => $user->id,
        ]);


        Cache::forget("doctor:{$doctor->id}:patient:{$patientId}:medical-card");
        Cache::forget("doctor:{$doctor->id}:appointments"); // <-- додаємо кеш для прийомів лікаря

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
