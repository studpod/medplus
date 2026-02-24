<?php

namespace App\Http\Controllers\Staff\Receptionist;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Patient, Reception, Doctor , Specialization, DoctorSchedules};

class MainReceptionistController extends Controller
{
    public function viewPatients(){
        $patients = Patient::with('doctor')->get();

        return response()->json([
            'patients' => $patients
        ]);
    }
    public function viewReception()
    {
        // Отримуємо всі прийоми з пацієнтами та лікарями
        $receptions = Reception::with(['patient', 'doctor'])->orderBy('date', 'asc')->orderBy('time', 'asc')->get();

        $data = $receptions->map(function($reception) {
            return [
                'id' => $reception->id,
                'date' => $reception->date,
                'time' => $reception->time,
                'status' => $reception->status,
                'patient' => [
                    'id' => $reception->patient->id,
                    'name' => $reception->patient->last_name . ' ' . $reception->patient->first_name . ' ' . $reception->patient->middle_name,
                    'phone' => $reception->patient->phone,
                ],
                'doctor' => $reception->doctor ? [
                    'id' => $reception->doctor->id,
                    'name' => $reception->doctor->last_name . ' ' . $reception->doctor->first_name,
                ] : null
            ];
        });

        return response()->json([
            'receptions' => $data
        ]);
    }

    public function viewDoctors()
    {
        // Отримуємо всіх лікарів разом зі спеціалізацією та розкладом
        $doctors = Doctor::with(['specialization', 'schedules'])->get();

        $data = $doctors->map(function ($doctor) {
            return [
                'id' => $doctor->id,
                'name' => $doctor->last_name . ' ' . $doctor->first_name . ' ' . ($doctor->middle_name ?? ''),
                'phone' => $doctor->phone,
                'specialization' => [
                    'id' => $doctor->specialization->id,
                    'name' => $doctor->specialization->name,
                    'description' => $doctor->specialization->description,
                ],
                'schedule' => $doctor->schedules->map(function ($schedule) {
                    return [
                        'day_of_week' => $schedule->day_of_week,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                    ];
                }),
            ];
        });

        return response()->json([
            'doctors' => $data
        ]);
    }

    public function addPatient(Request $request)
    {
        $validated = $request->validate([
            'last_name'      => 'required|string',
            'first_name'     => 'required|string',
            'middle_name'    => 'nullable|string',
            'gender'         => 'required|in:male,female',
            'date_of_birth'  => 'required|date',
            'phone'          => 'required|string'
        ]);

        // Перевірка чи вже існує пацієнт з таким телефоном
        $existing = Patient::where('phone', $validated['phone'])->first();

        if ($existing) {
            return response()->json([
                'message' => 'Пацієнт вже існує',
                'patient' => $existing
            ]);
        }

        $patient = Patient::create([
            'user_id'       => null,
            'last_name'     => $validated['last_name'],
            'first_name'    => $validated['first_name'],
            'middle_name'   => $validated['middle_name'],
            'gender'        => $validated['gender'],
            'date_of_birth' => $validated['date_of_birth'],
            'phone'         => $validated['phone'],
        ]);

        return response()->json([
            'message' => 'Пацієнта створено',
            'patient' => $patient
        ], 201);
    }
    public function addReception(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id'  => 'required|exists:doctors,id',
            'date'       => 'required|date|after_or_equal:today',
            'time'       => 'required|date_format:H:i',
        ]);

        // Перевірка зайнятого часу
        $exists = Reception::where('doctor_id', $validated['doctor_id'])
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'Цей час вже зайнятий'
            ], 422);
        }

        $reception = Reception::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id'  => $validated['doctor_id'],
            'date'       => $validated['date'],
            'time'       => $validated['time'],
            'status'     => 'expected',
        ]);

        return response()->json([
            'message' => 'Запис створено',
            'reception' => $reception
        ], 201);
    }
}
