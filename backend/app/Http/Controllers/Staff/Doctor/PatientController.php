<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use App\Models\{Patient};

class PatientController extends Controller
{
    public function viewPatients(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        $isFamilyDoctor = optional($doctor->specialization)->name === 'Сімейний лікар (Терапевт)';

        if ($isFamilyDoctor) {
            $patients = Patient::with('user')
                ->where('doctor_id', $doctor->id)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
        } else {
            $patients = Patient::with('user')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
        }


        $uids = $patients
            ->pluck('user.firebase_uid')
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $emailsMap = [];

        if (!empty($uids)) {
            try {
                $factory = (new Factory)
                    ->withServiceAccount(storage_path('/firebase/medplus-auth-fb352-firebase-adminsdk-fbsvc-9dc637fc58.json'));

                $auth = $factory->createAuth();


                $firebaseUsers = $auth->getUsers($uids);

                foreach ($firebaseUsers as $fbUser) {
                    $emailsMap[$fbUser->uid] = $fbUser->email;
                }

            } catch (\Exception $e) {
                \Log::error("Firebase batch error: " . $e->getMessage());
            }
        }


        $patients = $patients->map(function ($p) use ($emailsMap) {
            return [
                'id' => $p->id,
                'first_name' => $p->first_name,
                'last_name' => $p->last_name,
                'middle_name' => $p->middle_name,
                'date_of_birth' => $p->date_of_birth,
                'phone' => $p->phone,

                'email' => $p->user && isset($emailsMap[$p->user->firebase_uid])
                    ? $emailsMap[$p->user->firebase_uid]
                    : null,
            ];
        });

        return response()->json([
            'doctor_id' => $doctor->id,
            'patients' => $patients,
            'is_family_doctor' => $isFamilyDoctor
        ]);
    }
    public function searchPatient(Request $request)
    {
        $query = $request->query('query');

        if (!$query || mb_strlen($query) < 3) {
            return response()->json([
                'patients' => []
            ]);
        }

        $patients = Patient::with('user')
            ->whereNull('doctor_id')
            ->whereRaw("
            LOWER(CONCAT(last_name, ' ', first_name, ' ', middle_name)) LIKE ?
        ", ['%' . mb_strtolower($query) . '%'])
            ->orderBy('last_name')
            ->limit(10)
            ->get();

        //  Firebase
        $factory = (new Factory)
            ->withServiceAccount(storage_path('/firebase/medplus-auth-fb352-firebase-adminsdk-fbsvc-9dc637fc58.json'));

        $auth = $factory->createAuth();

        $patients->transform(function ($patient) use ($auth) {
            $email = null;

            if ($patient->user && $patient->user->firebase_uid) {
                try {
                    $firebaseUser = $auth->getUser($patient->user->firebase_uid);
                    $email = $firebaseUser->email;
                } catch (\Exception $e) {
                    \Log::error("Firebase error: " . $e->getMessage());
                }
            }

            $patient->email = $email;

            return $patient;
        });

        return response()->json([
            'patients' => $patients
        ]);
    }
    public function assignPatient(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Тільки для лікаря'], 403);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Доктор не знайдений'], 404);
        }

        $patientId = $request->query('patient_id');

        $patient = Patient::find($patientId);

        if (!$patient) {
            return response()->json(['error' => 'Пацієнт не знайдений'], 404);
        }

        if ($patient->doctor_id) {
            return response()->json(['error' => 'Пацієнт вже має лікаря'], 400);
        }


        $isFamilyDoctor = optional($doctor->specialization)->name === 'Сімейний лікар (Терапевт)';

        if (!$isFamilyDoctor) {
            return response()->json(['error' => 'Тільки сімейний лікар може додавати'], 403);
        }


        $limit = 50;

        $currentCount = Patient::where('doctor_id', $doctor->id)->count();

        if ($currentCount >= $limit) {
            return response()->json(['error' => 'Ліміт досягнуто'], 400);
        }

        $patient->doctor_id = $doctor->id;
        $patient->save();

        return response()->json([
            'message' => 'Пацієнта додано'
        ]);
    }
    public function unassignPatient(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Тільки для лікаря'], 403);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Доктор не знайдений'], 404);
        }

        $patientId = $request->query('patient_id');

        $patient = Patient::find($patientId);

        if (!$patient) {
            return response()->json(['error' => 'Пацієнт не знайдений'], 404);
        }


        if ($patient->doctor_id !== $doctor->id) {
            return response()->json(['error' => 'Це не ваш пацієнт'], 403);
        }


        $isFamilyDoctor = optional($doctor->specialization)->name === 'Сімейний лікар (Терапевт)';

        if (!$isFamilyDoctor) {
            return response()->json(['error' => 'Тільки сімейний лікар може видаляти'], 403);
        }


        $patient->doctor_id = null;
        $patient->save();

        return response()->json([
            'message' => 'Пацієнта відкріплено'
        ]);
    }
}


