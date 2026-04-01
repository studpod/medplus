<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\{Appointment, Patient, User, Doctor, DoctorSchedules, AppointmentService, Service, Referral};



class ReceptionController extends Controller
{

    public function addReception(Request $request)
    {
        $user = auth()->user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json([
                'error' => 'Профіль пацієнта не знайдено'
            ], 404);
        }

        $validated = $request->validate([
            'doctor_id'    => 'required|exists:doctors,id',
            'service_ids'  => 'required|array|min:1',
            'service_ids.*'=> 'exists:services,id',
            'date'         => 'required|date|after_or_equal:today',
            'time'         => 'required|date_format:H:i',
        ]);

        $doctor = Doctor::with('schedules', 'specialization')->findOrFail($validated['doctor_id']);

        $dayOfWeek = Carbon::parse($validated['date'])->format('l');

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

        $slotBusy = Appointment::where('doctor_id', $doctor->id)
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->exists();

        if ($slotBusy) {
            return response()->json([
                'error' => 'На цей час вже є запис'
            ], 422);
        }

        // 🔥 ПЕРЕВІРКА НАПРАВЛЕННЯ
        $hasReferral = Referral::where('patient_id', $patient->id)
            ->where('to_specialization_id', $doctor->specialization_id)
            ->exists();

        $services = Service::whereIn('id', $validated['service_ids'])->get();

        $isOnline = $services->contains(function ($service) {
            return $service->name === 'Онлайн консультація з сімейним лікарем';
        });

        if ($isOnline && $doctor->specialization->name !== 'Сімейний лікар') {
            return response()->json([
                'error' => 'Онлайн консультація доступна тільки для сімейного лікаря'
            ], 422);
        }

        $appointment = Appointment::create([
            'patient_id'   => $patient->id,
            'doctor_id'    => $doctor->id,
            'date'         => $validated['date'],
            'time'         => $validated['time'],
            'status'       => 'expected',
            'is_online'    => $isOnline,
            'has_referral' => $hasReferral, // 🔥 ВАЖЛИВО
        ]);

        foreach ($services as $service) {
            AppointmentService::create([
                'appointment_id' => $appointment->id,
                'service_id'     => $service->id,
                'price'          => $service->price,
            ]);
        }

        return response()->json([
            'message' => 'Запис на прийом успішно створено',
            'appointment' => $appointment
        ], 201);
    }
}
