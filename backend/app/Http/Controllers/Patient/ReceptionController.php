<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\{Appointment, Patient, User, Doctor, DoctorSchedules, AppointmentService, Service};



class ReceptionController extends Controller
{

//    public function addReception(Request $request)
//    {
//        $user = auth()->user();
//
//        $validated = $request->validate([
//            'doctor_id'     => 'required|exists:doctors,id',
//            'service_ids'   => 'required|array|min:1',
//            'service_ids.*' => 'exists:services,id',
//            'date'          => 'required|date|after_or_equal:today',
//            'time'          => 'required|date_format:H:i',
//
//            // для неавторизованих
//            'patient.full_name' => 'nullable|string|max:255',
//            'patient.phone'     => 'nullable|string|max:30',
//        ]);
//
//        /**
//         * =========================
//         * 1. Визначаємо пацієнта
//         * =========================
//         */
//        if ($user && $user->patient) {
//            $patient = $user->patient;
//        } else {
//            if (!$request->patient) {
//                return response()->json([
//                    'error' => 'Не передано дані пацієнта'
//                ], 422);
//            }
//
//            $fullName = $validated['patient']['full_name'] ?? 'не вказано';
//            $phone    = $validated['patient']['phone'] ?? 'не вказано';
//
//            // розбиваємо ПІБ
//            $parts = explode(' ', trim($fullName));
//
//            $patient = Patient::create([
//                'user_id'      => $user->id ?? null,
//                'last_name'    => $parts[0] ?? 'не вказано',
//                'first_name'   => $parts[1] ?? 'не вказано',
//                'middle_name'  => $parts[2] ?? 'не вказано',
//                'gender'       => 'male', // або дефолт
//                'address'      => 'не вказано',
//                'date_of_birth'=> now()->toDateString(),
//                'phone'        => $phone,
//            ]);
//        }
//
//        /**
//         * =========================
//         * 2. Перевірка лікаря
//         * =========================
//         */
//        $doctor = Doctor::with('schedules', 'specialization')
//            ->findOrFail($validated['doctor_id']);
//
//        $dayOfWeek = Carbon::parse($validated['date'])->format('l');
//
//        $scheduleExists = $doctor->schedules()
//            ->where('day_of_week', $dayOfWeek)
//            ->where('start_time', '<=', $validated['time'])
//            ->where('end_time', '>=', $validated['time'])
//            ->exists();
//
//        if (!$scheduleExists) {
//            return response()->json([
//                'error' => 'Лікар не працює в обраний час'
//            ], 422);
//        }
//
//
//        $slotBusy = Appointment::where('doctor_id', $doctor->id)
//            ->where('date', $validated['date'])
//            ->where('time', $validated['time'])
//            ->exists();
//
//        if ($slotBusy) {
//            return response()->json([
//                'error' => 'На цей час вже є запис'
//            ], 422);
//        }
//
//
//        $services = Service::whereIn('id', $validated['service_ids'])->get();
//
//        $isOnline = $services->contains(fn($s) =>
//            $s->name === 'Онлайн консультація з сімейним лікарем'
//        );
//
//        if ($isOnline && $doctor->specialization->name !== 'Сімейний лікар') {
//            return response()->json([
//                'error' => 'Онлайн консультація доступна тільки для сімейного лікаря'
//            ], 422);
//        }
//
//        $appointment = Appointment::create([
//            'patient_id' => $patient->id,
//            'doctor_id'  => $doctor->id,
//            'date'       => $validated['date'],
//            'time'       => $validated['time'],
//            'status'     => 'expected',
//            'is_online'  => $isOnline,
//        ]);
//
//        foreach ($services as $service) {
//            AppointmentService::create([
//                'appointment_id' => $appointment->id,
//                'service_id'     => $service->id,
//                'price'          => $service->price,
//            ]);
//        }
//
//        return response()->json([
//            'message' => 'Запис на прийом успішно створено',
//            'appointment' => $appointment
//        ], 201);
//    }
//
//
//    public function addReceptionAuth(Request $request)
//    {
//        $user = auth()->user();
//
//        $patient = $user->patient;
//
//        if (!$patient) {
//            return response()->json(['error' => 'Профіль не знайдено'], 404);
//        }
//
//        return $this->createAppointment($request, $patient);
//    }
    private function createAppointment(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'doctor_id'     => 'required|exists:doctors,id',
            'service_ids'   => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
            'date'          => 'required|date|after_or_equal:today',
            'time'          => 'required|date_format:H:i',
        ]);

        $doctor = Doctor::with('schedules', 'specialization')
            ->findOrFail($validated['doctor_id']);

        /**
         * =========================
         * CHECK SCHEDULE
         * =========================
         */
        $dayOfWeek = Carbon::parse($validated['date'])->format('l');

        $scheduleExists = $doctor->schedules()
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $validated['time'])
            ->where('end_time', '>=', $validated['time'])
            ->exists();

        if (!$scheduleExists) {
            return response()->json([
                'error' => 'Лікар не працює в цей час'
            ], 422);
        }

        /**
         * =========================
         * CHECK SLOT
         * =========================
         */
        $slotBusy = Appointment::where('doctor_id', $doctor->id)
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->exists();

        if ($slotBusy) {
            return response()->json([
                'error' => 'Час зайнятий'
            ], 422);
        }

        /**
         * =========================
         * SERVICES + ONLINE LOGIC
         * =========================
         */
        $services = Service::whereIn('id', $validated['service_ids'])->get();

        $isOnline = $services->contains(function ($service) {
            return $service->name === 'Онлайн консультація з сімейним лікарем';
        });

        if ($isOnline && $doctor->specialization->name !== 'Сімейний лікар (Терапевт)') {
            return response()->json([
                'error' => 'Онлайн консультація доступна тільки для сімейного лікаря'
            ], 422);
        }

        /**
         * =========================
         * CREATE APPOINTMENT
         * =========================
         */
        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id'  => $doctor->id,
            'date'       => $validated['date'],
            'time'       => $validated['time'],
            'status'     => 'expected',
            'is_online'  => $isOnline,
        ]);

        foreach ($services as $service) {
            AppointmentService::create([
                'appointment_id' => $appointment->id,
                'service_id'     => $service->id,
                'price'          => $service->price,
            ]);
        }

        return response()->json([
            'message' => 'Запис створено',
            'appointment' => $appointment
        ], 201);
    }
    public function addReceptionGuest(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string',
            'phone' => 'required|string',
            'doctor_id' => 'required|exists:doctors,id',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
        ]);

        /**
         * =========================
         * NORMALIZE PHONE
         * =========================
         */
        $phone = preg_replace('/\D+/', '', $validated['phone']);

        if (!str_starts_with($phone, '38')) {
            $phone = '38' . $phone;
        }

        /**
         * =========================
         * FIND OR CREATE PATIENT
         * =========================
         */
        $patient = Patient::firstOrCreate(
            ['phone' => $phone],
            [
                'first_name' => 'не вказано',
                'last_name'  => 'не вказано',
                'middle_name'=> null,
                'gender'     => 'male',
                'address'    => 'не вказано',
                'date_of_birth' => now(),
            ]
        );

        /**
         * =========================
         * UPDATE NAME IF EMPTY
         * =========================
         */
        if ($patient->last_name === 'не вказано') {
            $parts = explode(' ', $validated['full_name']);

            $patient->update([
                'last_name'   => $parts[0] ?? 'не вказано',
                'first_name'  => $parts[1] ?? 'не вказано',
                'middle_name' => $parts[2] ?? 'не вказано',
            ]);
        }

        /**
         * =========================
         * CREATE APPOINTMENT
         * =========================
         */
        return $this->createAppointment($request, $patient);
    }

    public function addReceptionAuth(Request $request)
    {
        $user = auth()->user();

        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['error' => 'Профіль не знайдено'], 404);
        }

        return $this->createAppointment($request, $patient);
    }
}
