<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Middleware\RoleMiddleware;
use App\Models\{Patient, User, MedicalRecord, Reception};

class PersonalOfficeController extends Controller
{

    public function viewProfile(){

        $user = Auth::user();

        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }

        $patient = $user->patient;

        if (!$patient) {
            return response()->json([
                'error' => 'Профіль не знайдено. Спочатку створіть його.'
            ], 404);
        }

        return response()->json([
            'patient' => $patient
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
            'phone' => 'required|string|max:13|unique:patients,phone'
        ]);

        $patient = Patient::create([
            'user_id' => $user->id,
            'last_name' => $validated['last_name'],
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'gender' => $validated['gender'],
            'date_of_birth' => $validated['date_of_birth'],
            'phone' => $validated['phone']
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
        ]);

        $patient->update($validated);

        return response()->json([
            'message' => 'Особисті дані успішно оновлено',
            'patient' => $patient
        ], 200);
    }
    public function viewMedicalRecords()
    {
        $user = auth()->user();

        $patient = $user->patient;

        if (!$patient) {
            return response()->json([
                'error' => 'Профіль пацієнта не знайдено'
            ], 404);
        }

        $records = MedicalRecord::whereHas('reception', function ($query) use ($patient) {
            $query->where('patient_id', $patient->id);
        })
            ->with([
                'reception.doctor.user',
                'labsResults'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'medical_records' => $records
        ]);
    }
    public function viewReception(){
        $user = auth()->user();

        $patient = $user->patient;

        if (!$patient) {
            return response()->json([
                'error' => 'Профіль пацієнта не знайдено'
            ], 404);
        }

        $receptions = $patient->receptions()
            ->with([
                'doctor.user',
                'doctor.specialization'
            ])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

        return response()->json([
            'receptions' => $receptions
        ]);
}
}
