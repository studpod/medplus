<?php

namespace App\Http\Controllers\Staff\Receptionist;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

use App\Models\{
    Appointment,
    Doctor,
    DoctorSchedules,
    Patient,
    Service,
    AppointmentService
};

class ReceptionistAppointmentController extends Controller
{
    public function createAppointment(Request $request)
    {
        $validated = $request->validate([

            /*
            |--------------------------------------------------------------------------
            | MAIN
            |--------------------------------------------------------------------------
            */

            'new_patient' => 'nullable|boolean',

            'patient_id' => 'nullable|exists:patients,id',

            'doctor_id' => 'required|exists:doctors,id',

            'date' => 'required|date',

            'time' => 'required',

            'is_online' => 'nullable|boolean',

            /*
            |--------------------------------------------------------------------------
            | NEW PATIENT
            |--------------------------------------------------------------------------
            */

            'last_name' => 'required_if:new_patient,true|string|max:255',

            'first_name' => 'required_if:new_patient,true|string|max:255',

            'middle_name' => 'nullable|string|max:255',

            'gender' => 'required_if:new_patient,true|in:male,female',

            'address' => 'required_if:new_patient,true|string|max:500',

            'date_of_birth' => 'required_if:new_patient,true|date',

            'phone' => 'required_if:new_patient,true|string|max:20',

            'notes' => 'nullable|string|max:1000',

            /*
            |--------------------------------------------------------------------------
            | SERVICES
            |--------------------------------------------------------------------------
            */

            'services' => 'required|array|min:1',

            'services.*' => 'exists:services,id',
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREATE NEW PATIENT
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['new_patient'])) {

            $patient = Patient::create([

                'user_id' => null,

                'doctor_id' => null,

                'last_name' => $validated['last_name'],

                'first_name' => $validated['first_name'],

                'middle_name' => $validated['middle_name'] ?? null,

                'gender' => $validated['gender'],

                'address' => $validated['address'],

                'date_of_birth' => $validated['date_of_birth'],

                'phone' => $validated['phone'],

                'notes' => $validated['notes'] ?? null,
            ]);

            $patientId = $patient->id;

        } else {

            /*
            |--------------------------------------------------------------------------
            | EXISTING PATIENT
            |--------------------------------------------------------------------------
            */

            if (empty($validated['patient_id'])) {

                return response()->json([
                    'error' => 'Пацієнта не обрано'
                ], 422);
            }

            $patientId = $validated['patient_id'];
        }

        /*
        |--------------------------------------------------------------------------
        | DOCTOR
        |--------------------------------------------------------------------------
        */

        $doctor = Doctor::with('specialization')->find($validated['doctor_id']);

        if (!$doctor) {

            return response()->json([
                'error' => 'Лікаря не знайдено'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK WORKING DAY
        |--------------------------------------------------------------------------
        */

        $dayOfWeek = Carbon::parse(
            $validated['date']
        )->format('l');

        $schedule = DoctorSchedules::where(
            'doctor_id',
            $doctor->id
        )
            ->where(
                'day_of_week',
                $dayOfWeek
            )
            ->get();

        if ($schedule->isEmpty()) {

            return response()->json([
                'error' => 'Лікар не працює у цей день'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK TIME
        |--------------------------------------------------------------------------
        */

        $selectedTime = Carbon::parse(
            $validated['time']
        )->format('H:i:s');

        $isWorkingTime = $schedule->contains(function ($item) use ($selectedTime) {

            return
                $selectedTime >= $item->start_time &&
                $selectedTime < $item->end_time;
        });

        if (!$isWorkingTime) {

            return response()->json([
                'error' => 'Обраний час поза графіком лікаря'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK APPOINTMENT EXISTS
        |--------------------------------------------------------------------------
        */

        $appointmentExists = Appointment::where(
            'doctor_id',
            $doctor->id
        )
            ->where(
                'date',
                $validated['date']
            )
            ->where(
                'time',
                $selectedTime
            )
            ->whereIn('status', [
                'expected',
                'completed'
            ])
            ->exists();

        if ($appointmentExists) {

            return response()->json([
                'error' => 'На цей час вже є запис'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | ONLINE CONSULTATION
        |--------------------------------------------------------------------------
        */

        $isOnline = false;

        $services = Service::whereIn(
            'id',
            $validated['services']
        )->get();

        $hasOnlineService = $services->contains(function ($service) {

            return str_contains(
                mb_strtolower($service->name),
                'онлайн'
            );
        });

        $isFamilyDoctor = false;

        if ($doctor->specialization) {

            $specializationName = mb_strtolower(
                $doctor->specialization->name
            );

            $isFamilyDoctor =
                str_contains($specializationName, 'сімей') ||
                str_contains($specializationName, 'терапевт');
        }

        if ($isFamilyDoctor && $hasOnlineService) {
            $isOnline = true;
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE APPOINTMENT
        |--------------------------------------------------------------------------
        */

        $appointment = Appointment::create([

            'patient_id' => $patientId,

            'doctor_id' => $doctor->id,

            'date' => $validated['date'],

            'time' => $selectedTime,

            'is_online' => $isOnline,

            'status' => 'expected'
        ]);

        /*
        |--------------------------------------------------------------------------
        | SERVICES
        |--------------------------------------------------------------------------
        */

        foreach ($services as $service) {

            AppointmentService::create([

                'appointment_id' => $appointment->id,

                'service_id' => $service->id,

                'price' => $service->price
            ]);
        }

        return response()->json([

            'message' => 'Прийом успішно створено',

            'appointment' => $appointment
        ]);
    }
    public function getReceptionistAppointments(Request $request)
    {
        $query = Appointment::with([
            'patient',
            'doctor.specialization',
            'appointmentServices.service'
        ]);

        /*
        |--------------------------------------------------------------------------
        | SEARCH (ПІБ пацієнта або лікаря)
        |--------------------------------------------------------------------------
        */
        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->whereHas('patient', function ($p) use ($search) {
                    $p->where('first_name', 'like', "%$search%")
                        ->orWhere('last_name', 'like', "%$search%")
                        ->orWhere('middle_name', 'like', "%$search%");
                })
                    ->orWhereHas('doctor', function ($d) use ($search) {
                        $d->where('first_name', 'like', "%$search%")
                            ->orWhere('last_name', 'like', "%$search%")
                            ->orWhere('middle_name', 'like', "%$search%");
                    });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | DOCTOR FILTER
        |--------------------------------------------------------------------------
        */
        if ($request->doctor_id) {
            $query->where('doctor_id', $request->doctor_id);
        }

        /*
        |--------------------------------------------------------------------------
        | STATUS FILTER
        |--------------------------------------------------------------------------
        */
        if ($request->status) {
            $query->where('status', $request->status);
        }

        /*
        |--------------------------------------------------------------------------
        | DATE FILTER
        |--------------------------------------------------------------------------
        */
        if ($request->date_from && $request->date_to) {
            $query->whereBetween('date', [
                $request->date_from,
                $request->date_to
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | SORTING
        |--------------------------------------------------------------------------
        */
        $sortField = $request->sort_field ?? 'date';
        $sortDir = $request->sort_dir ?? 'asc';

        $allowedSorts = ['date', 'time', 'status'];

        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'date';
        }

        $appointments = $query
            ->orderBy($sortField, $sortDir)
            ->orderBy('time', 'asc')
            ->get();

        return response()->json([
            'receptions' => $appointments
        ]);
    }
    public function updateAppointment(Request $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'error' => 'Прийом не знайдено'
            ], 404);
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date',
            'time' => 'required',

            'services' => 'required|array|min:1',
            'services.*' => 'exists:services,id',
        ]);

        $doctor = Doctor::with('specialization')->find($validated['doctor_id']);

        if (!$doctor) {
            return response()->json(['error' => 'Лікаря не знайдено'], 404);
        }

        $dayOfWeek = Carbon::parse($validated['date'])->format('l');

        $schedule = DoctorSchedules::where('doctor_id', $doctor->id)
            ->where('day_of_week', $dayOfWeek)
            ->get();

        if ($schedule->isEmpty()) {
            return response()->json(['error' => 'Лікар не працює у цей день'], 422);
        }

        $selectedTime = Carbon::parse($validated['time'])->format('H:i:s');

        $isWorkingTime = $schedule->contains(function ($item) use ($selectedTime) {
            return $selectedTime >= $item->start_time && $selectedTime < $item->end_time;
        });

        if (!$isWorkingTime) {
            return response()->json(['error' => 'Час поза графіком'], 422);
        }

        $exists = Appointment::where('doctor_id', $doctor->id)
            ->where('date', $validated['date'])
            ->where('time', $selectedTime)
            ->where('id', '!=', $appointment->id)
            ->whereIn('status', ['expected', 'completed'])
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'Цей час вже зайнятий'], 422);
        }

        $services = Service::whereIn('id', $validated['services'])->get();

        $appointment->update([
            'doctor_id' => $doctor->id,
            'date' => $validated['date'],
            'time' => $selectedTime,
        ]);

        // reset services
        AppointmentService::where('appointment_id', $appointment->id)->delete();

        foreach ($services as $service) {
            AppointmentService::create([
                'appointment_id' => $appointment->id,
                'service_id' => $service->id,
                'price' => $service->price
            ]);
        }

        return response()->json([
            'message' => 'Прийом оновлено',
            'appointment' => $appointment
        ]);
    }

    public function getReceptionistAppointment($id)
    {
        $appointment = Appointment::with([
            'patient.doctor',
            'doctor.specialization',
            'appointmentServices.service'
        ])->find($id);

        if (!$appointment) {
            return response()->json([
                'error' => 'Прийом не знайдено'
            ], 404);
        }

        return response()->json([
            'appointment' => [
                'id' => $appointment->id,

                'patient_id' => $appointment->patient_id,
                'patient' => [
                    'id' => $appointment->patient->id,
                    'last_name' => $appointment->patient->last_name,
                    'first_name' => $appointment->patient->first_name,
                    'middle_name' => $appointment->patient->middle_name,
                    'gender' => $appointment->patient->gender,
                    'address' => $appointment->patient->address,
                    'date_of_birth' => $appointment->patient->date_of_birth,
                    'phone' => $appointment->patient->phone,
                    'notes' => $appointment->patient->notes,


                    'doctor_full_name' => $appointment->patient->doctor
                        ? trim(
                            $appointment->patient->doctor->last_name . ' ' .
                            $appointment->patient->doctor->first_name . ' ' .
                            $appointment->patient->doctor->middle_name
                        )
                        : null,
                ],

                'doctor_id' => $appointment->doctor_id,
                'doctor' => [
                    'id' => $appointment->doctor->id,
                    'last_name' => $appointment->doctor->last_name,
                    'first_name' => $appointment->doctor->first_name,
                    'middle_name' => $appointment->doctor->middle_name,
                    'specialization_id' => $appointment->doctor->specialization_id,
                    'specialization' => $appointment->doctor->specialization
                ],

                'date' => $appointment->date,
                'time' => $appointment->time,
                'status' => $appointment->status,

                'services' => $appointment->appointmentServices->map(function ($s) {
                    return [
                        'id' => $s->service->id,
                        'service_id' => $s->service->id,
                        'name' => $s->service->name,
                        'price' => $s->service->price
                    ];
                }),
            ]
        ]);
    }
}
