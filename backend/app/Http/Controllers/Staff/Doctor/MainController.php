<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Doctor, Patient, DoctorSchedules, MedicalRecord};


class MainController extends Controller
{
    public function viewSchedule(Request $request)
    {
        // Отримуємо авторизованого користувача
        $user = auth()->user();

        // Перевіряємо, що користувач є лікарем
        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        // Отримуємо id лікаря з таблиці doctors
        $doctor = $user->doctor; // Має бути відношення в моделі User: hasOne(Doctor)

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        // Витягуємо графік лікаря
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
        // Отримуємо авторизованого користувача
        $user = auth()->user();

        // Перевіряємо, що це лікар
        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        // Отримуємо профіль лікаря
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        // Витягуємо всі прийоми для лікаря, сортуємо за статусом
        $receptions = \App\Models\Reception::with('patient') // додаємо інформацію про пацієнта
        ->where('doctor_id', $doctor->id)
            ->orderByRaw("FIELD(status, 'expected', 'completed', 'cancelled')")
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return response()->json([
            'doctor_id' => $doctor->id,
            'receptions' => $receptions
        ]);
    }

    public function viewPatients(Request $request)
    {
        // Отримуємо авторизованого користувача
        $user = auth()->user();

        // Перевіряємо, що користувач — лікар
        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        // Отримуємо профіль лікаря
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        // Витягуємо всіх пацієнтів, які закріплені за лікарем
        $patients = Patient::with('user') // додаємо інформацію про користувача (email, phone)
        ->where('doctor_id', $doctor->id)
            ->orderBy('last_name', 'asc')
            ->orderBy('first_name', 'asc')
            ->get();

        return response()->json([
            'doctor_id' => $doctor->id,
            'patients' => $patients
        ]);
    }

    public function viewMedicalCard($patientId)
    {
        // Авторизований користувач
        $user = auth()->user();

        // Перевірка, що це лікар
        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        // Профіль лікаря
        $doctor = $user->doctor;
        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        // Перевіряємо, чи пацієнт закріплений за лікарем
        $patient = Patient::with('user')->where('id', $patientId)->where('doctor_id', $doctor->id)->first();
        if (!$patient) {
            return response()->json(['error' => 'Пацієнт не знайдений або не закріплений за вами'], 404);
        }

        // Витягуємо всі медичні записи пацієнта через прийоми
        $medicalRecords = MedicalRecord::with(['reception', 'labsResults' => function($q) {
            $q->orderBy('performed_at', 'desc');
        }])
            ->whereHas('reception', function($q) use ($patientId) {
                $q->where('patient_id', $patientId);
            })
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
                'email' => $patient->user->email ?? null
            ],
            'medical_records' => $medicalRecords
        ]);
    }
}
