<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VideoSession;
use Illuminate\Support\Str;

class VideoSessionController extends Controller
{
    public function create(Request $request)
    {
        $doctorId = $request->doctor_id;
        $patientId = $request->patient_id;

        $roomId = 'call_' . Str::random(12);

        $session = VideoSession::create([
            'doctor_id' => $doctorId,
            'patient_id' => $patientId,
            'room_id' => $roomId
        ]);

        return response()->json($session);
    }

    public function get($room)
    {
        $session = VideoSession::where('room_id',$room)->firstOrFail();

        return response()->json($session);
    }

}
