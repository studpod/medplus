<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentStatusLog;
use App\Models\VideoCall;
use Illuminate\Http\Request;

class VideoConsultationController extends Controller
{
    public function startVideoCall(Request $request)
    {
        $user = auth()->user();
        $doctor = $user->doctor;

        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id'
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);

        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        if (!$appointment->is_online) {
            return response()->json(['error' => 'Not online appointment'], 400);
        }

        $existingCall = VideoCall::where('appointment_id', $appointment->id)
            ->whereIn('status', ['waiting', 'active'])
            ->first();

        if ($existingCall) {
            return response()->json([
                'room_id' => $existingCall->room_id
            ]);
        }
        $roomId = 'call_' . rand(100000, 999999);

        VideoCall::create([
            'appointment_id' => $appointment->id,
            'room_id' => $roomId,
            'status' => 'waiting'
        ]);

        return response()->json([
            'room_id' => $roomId
        ]);
    }
    public function endVideoCall(Request $request)
    {
        $request->validate([
            'room_id' => 'required|string|exists:video_calls,room_id'
        ]);

        $videoCall = VideoCall::where('room_id', $request->room_id)->firstOrFail();
        $appointment = $videoCall->appointment;

        $videoCall->status = 'ended';
        $videoCall->save();


        AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'old_status' => $appointment->status,
            'new_status' => 'completed',
            'changed_by' => auth()->id()
        ]);


        $appointment->status = 'completed';
        $appointment->save();

        return response()->json([
            'message' => 'Онлайн консультація завершена, статусы обновлены'
        ]);
    }
}
