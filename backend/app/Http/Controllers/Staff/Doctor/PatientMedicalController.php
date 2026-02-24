<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Patient, Doctor, Reception, MedicalRecord};
use Illuminate\Support\Facades\Auth;

class PatientMedicalController extends Controller
{
    public function addMedicalCard(Request $request, $patientId)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'doctor') {
            return response()->json([
                'error' => 'Доступ дозволений лише лікарям'
            ], 403);
        }

        // user_id лікаря
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json([
                'error' => 'Профіль лікаря не знайдений'
            ], 404);
        }

        // Валідація
        $validated = $request->validate([
            'reception_id'     => 'required|exists:receptions,id',
            'chief_complaint'  => 'required|string',
            'diagnosis'        => 'required|string',
            'treatment'        => 'required|string',
            'prescriptions'    => 'nullable|string',
            'notes'            => 'nullable|string',
            'start_date'       => 'nullable|date',
            'end_date'         => 'nullable|date|after_or_equal:start_date',
        ]);

        // пошук пацієнта
        $patient = Patient::find($patientId);
        if (!$patient) {
            return response()->json([
                'error' => 'Пацієнт не знайдений'
            ], 404);
        }

        // пошук прийому
        $reception = Reception::where('id', $validated['reception_id'])
            ->where('patient_id', $patient->id)
            ->first();

        if (!$reception) {
            return response()->json([
                'error' => 'Прийом не знайдено для цього пацієнта'
            ], 404);
        }

        // перевірка прав лікаря
        // Якщо сімейний лікар
        if ($doctor->specialization->name === 'Сімейний лікар') {
            if ($patient->doctor_id !== $doctor->id) {
                return response()->json([
                    'error' => 'Цей пацієнт не закріплений за вами'
                ], 403);
            }
        } else {
            // Спеціаліст може додавати записи тільки якщо він прив'язаний до цього прийому
            if ($reception->doctor_id !== $doctor->id) {
                return response()->json([
                    'error' => 'Ви не можете додавати записи до цього прийому'
                ], 403);
            }
        }


        $medicalRecord = MedicalRecord::create([
            'reception_id'     => $reception->id,
            'chief_complaint'  => $validated['chief_complaint'],
            'diagnosis'        => $validated['diagnosis'],
            'treatment'        => $validated['treatment'],
            'prescriptions'    => $validated['prescriptions'] ?? null,
            'notes'            => $validated['notes'] ?? null,
            'start_date'       => $validated['start_date'] ?? now(),
            'end_date'         => $validated['end_date'] ?? null,
//            'status'           => 'active',
        ]);

        return response()->json([
            'message' => 'Запис у медичну карту успішно створено',
            'medical_record' => $medicalRecord
        ], 201);
    }
}
