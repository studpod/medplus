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


}
