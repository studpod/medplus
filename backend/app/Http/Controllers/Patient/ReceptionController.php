<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\{Reception, Patient, User, Doctor, DoctorSchedules};



class ReceptionController extends Controller
{
    public function addReception(Request $request){
        $user = auth()->user();

        $patient = $user->patient;
        if (!$patient) {
            return response()->json(['error' => 'Профіль пацієнта не знайдено'], 404);
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
//            'reception_type'=>'required|string',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
        ]);

        $doctor = Doctor::find($validated['doctor_id']);

        // перевірка чи обраний лікарь працює вказаний час
        $dayOfWeek = Carbon::parse($validated['date'])->format('l'); // Monday, Tuesday ...

        $scheduleExists = $doctor->schedules()
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $validated['time'])
            ->where('end_time', '>=', $validated['time'])
            ->exists();

        if (!$scheduleExists) {
            return response()->json(['error' => 'Лікарь не працює в обраний час'], 422);
        }

        // Перевірка чи немає запису на цей час
        $exists = Reception::where('doctor_id', $doctor->id)
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'На цей час вже є запис'], 422);
        }


        $reception = Reception::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => $validated['date'],
            'time' => $validated['time'],
            'status' => 'expected',
        ]);

        return response()->json([
            'message' => 'Запис на прийом успішно додано',
            'reception' => $reception
        ], 201);

    }
}
