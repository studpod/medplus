<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\{Appointment, Patient, User, Doctor, DoctorSchedules};



class ReceptionController extends Controller
{
    public function addReception(Request $request)
    {
        $user = auth()->user();

        $patient = $user->patient;
        if (!$patient) {
            return response()->json(['error' => 'Профіль пацієнта не знайдено'], 404);
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date'      => 'required|date|after_or_equal:today',
            'time'      => 'required|date_format:H:i',
        ]);

        $doctor = Doctor::with('schedules')->findOrFail($validated['doctor_id']);

        $dayOfWeek = Carbon::parse($validated['date'])->format('l');

        // Перевірка графіка лікаря
        $scheduleExists = $doctor->schedules()
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $validated['time'])
            ->where('end_time', '>=', $validated['time'])
            ->exists();

        if (!$scheduleExists) {
            return response()->json([
                'error' => 'Лікар не працює в обраний час'
            ], 422);
        }

        // Перевірка зайнятості часу
        $slotBusy = Appointment::where('doctor_id', $doctor->id)
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->exists();

        if ($slotBusy) {
            return response()->json([
                'error' => 'На цей час вже є запис'
            ], 422);
        }

        $reception = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id'  => $doctor->id,
            'date'       => $validated['date'],
            'time'       => $validated['time'],
            'status'     => 'expected',
        ]);

        return response()->json([
            'message'   => 'Запис на прийом успішно додано',
            'reception' => $reception
        ], 201);
    }
}
