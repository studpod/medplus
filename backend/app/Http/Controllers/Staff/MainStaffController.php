<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Doctor, Receptionist, Appointment};

class MainStaffController extends Controller
{
    public function me()
    {
        $user = auth()->user();

        $data = [
            'user' => $user,
            'role' => $user->role,
            'profile' => null
        ];

        switch ($user->role) {

            /*
            |--------------------------------------------------------------------------
            | DOCTOR
            |--------------------------------------------------------------------------
            */

            case 'doctor':

                $doctor = Doctor::with('specialization')
                    ->where('user_id', $user->id)
                    ->first();

                $data['profile'] = $doctor;

                break;

            /*
            |--------------------------------------------------------------------------
            | RECEPTIONIST
            |--------------------------------------------------------------------------
            */

            case 'receptionist':

                $receptionist = Receptionist::where(
                    'user_id',
                    $user->id
                )->first();

                $data['profile'] = $receptionist;

                break;


        }

        return response()->json($data);
    }



    public function getAppointments(Request $request)
    {
        $user = auth()->user();

        $query = Appointment::with([
            'patient',
            'doctor.specialization',
            'appointmentServices.service'
        ]);

        /*
        |--------------------------------------------------------------------------
        | ROLE LOGIC
        |--------------------------------------------------------------------------
        */

        if ($user->role === 'doctor') {

            // беремо doctor через user_id
            $doctorId = $user->doctor->id ?? null;

            if (!$doctorId) {
                return response()->json([
                    'receptions' => []
                ]);
            }

            $query->where('doctor_id', $doctorId);
        }

        // receptionist → НЕ ФІЛЬТРУЄМО (бачить все)

        /*
        |--------------------------------------------------------------------------
        | SORTING (найближчі зверху)
        |--------------------------------------------------------------------------
        */

        $appointments = $query
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return response()->json([
            'receptions' => $appointments
        ]);
    }
}
