<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Middleware\RoleMiddleware;
use App\Models\{Patient, User, MedicalRecord, Appointment, LabsResult,LabsFile, AppointmentService};

class PersonalOfficeController extends Controller
{

    public function viewProfile(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }

        $patient = $user->patient;


        if (!$patient) {
            return response()->json([
                'patient' => null
            ], 200);
        }
        if ($patient) {
            $patient->email = $request->get('firebase_email');
        }
        $patient->load('doctor');
        return response()->json([
            'patient' => $patient,
            'updated_at' => $patient->updated_at

        ], 200);
    }

    // Додавання особистої інформації
   public function addProfile(Request $request){

        $user = Auth::user();


        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }


        if (Patient::where('user_id', $user->id)->exists()) {
            return response()->json([
                'error' => 'Профіль вже створено'
            ], 400);
        }

        $validated = $request->validate([
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female',
            'date_of_birth' => 'required|date',
            'address' => 'nullable|string|max:255',
            'phone' => 'required|string|max:13|unique:patients,phone'
        ]);

        $patient = Patient::create([
            'user_id' => $user->id,
            'last_name' => $validated['last_name'],
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'gender' => $validated['gender'],
            'date_of_birth' => $validated['date_of_birth'],
            'phone' => $validated['phone'],
            'address' => $request->input('address')
        ]);

        return response()->json([
            'message' => 'Особисті дані успішно збережені',
            'patient' => $patient
        ], 201);
    }

    // Оновлення особистої інформації
    public function updateProfile(Request $request)
    {
        $user = auth()->user();


        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }


        $patient = $user->patient;

        if (!$patient) {
            return response()->json([
                'error' => 'Профіль не знайдено. Спочатку створіть його.'
            ], 404);
        }

        $validated = $request->validate([
            'last_name' => 'sometimes|string|max:255',
            'first_name' => 'sometimes|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'gender' => 'sometimes|in:male,female',
            'date_of_birth' => 'sometimes|date',
            'phone' => 'sometimes|string|max:13|unique:patients,phone,' . $patient->id,
            'notes' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $patient->update($validated);

        return response()->json([
            'message' => 'Особисті дані успішно оновлено',
            'patient' => $patient
        ], 200);
    }
    public function viewMedicalRecords()
    {
        try {

            $user = auth()->user();
            $patient = $user->patient;

            if (!$patient) {
                return response()->json([
                    'error' => 'Профіль пацієнта не знайдено'
                ], 404);
            }

            $appointments = Appointment::where('patient_id', $patient->id)
                ->where('status', 'completed')
                ->with([
                    'doctor.specialization',
                    'doctor.user',
                    'medicalRecord',
                    'appointmentServices.service',
                    'appointmentServices.labsResults.labsFiles',
                ])
                ->orderBy('date', 'desc')
                ->get()
                ->map(function ($appointment) {

                    $hasMedical = !is_null($appointment->medicalRecord);

                    $hasLabs = $appointment->appointmentServices
                        ->contains(fn ($s) => $s->labsResults->isNotEmpty());

                    // якщо немає ні мед запису ні аналізів
                    if (!$hasMedical && !$hasLabs) {
                        return null;
                    }

                    return [
                        'id' => $appointment->id,

                        'date' => $appointment->date,

                        'doctor_full_name' =>
                            trim(
                                ($appointment->doctor?->last_name ?? '') . ' ' .
                                ($appointment->doctor?->first_name ?? '') . ' ' .
                                ($appointment->doctor?->middle_name ?? '')
                            ),

                        'doctor_specialization' =>
                            $appointment->doctor?->specialization?->name
                            ?? "Спеціалізація не вказана",

                        // ======================
                        // CONSULTATION
                        // ======================
                        'medical_record' => $appointment->medicalRecord ? [
                            'chief_complaint' => $appointment->medicalRecord->chief_complaint,
                            'anamnesis' => $appointment->medicalRecord->anamnesis,
                            'initial_review' => $appointment->medicalRecord->initial_review,
                            'diagnosis' => $appointment->medicalRecord->diagnosis,
                            'treatment' => $appointment->medicalRecord->treatment,
                            'prescriptions' => $appointment->medicalRecord->prescriptions,
                            'notes' => $appointment->medicalRecord->notes,
                        ] : null,

                        // ======================
                        // SERVICES + LABS
                        // ======================
                        'services' => $appointment->appointmentServices
                            ->map(function ($service) {

                                return [
                                    'id' => $service->id,

                                    'name' => $service->service->name,

                                    'type' => $service->service->type,

                                    'labs' => $service->labsResults->map(fn ($lab) => [
                                        'id' => $lab->id,

                                        'files' => $lab->labsFiles->map(fn ($file) => [
                                            'id' => $file->id,

                                            'path' => asset('storage/' . $file->file_path),
                                        ])
                                    ]),
                                ];
                            })
                            ->values(),

                        'has_medical_record' => $hasMedical,
                        'has_labs' => $hasLabs,
                    ];
                })
                ->filter()
                ->values();

            return response()->json([
                'medical_records' => $appointments
            ]);

        } catch (\Exception $e) {

            \Log::error('MedicalRecords error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Помилка сервера'
            ], 500);
        }
    }
    public function viewReception(){
        $user = Auth::user();

        $patient = $user->patient;

        if (!$patient) {
            return response()->json([
                'error' => 'Профіль пацієнта не знайдено'
            ], 404);
        }

        $receptions = $patient->appointments()
            ->with([
                'doctor.user',
                'doctor.specialization',
                'videoCall',
                'services'
            ])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

        return response()->json([
            'receptions' => $receptions
        ]);
}
}
