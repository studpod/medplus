<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\{Service, Doctor, Specialization, Appointment};


class PublicViewController extends Controller
{
    public function services(){
        $services = Service::with('doctor')->get();

        return response()->json([
            'services' => $services
        ]);
    }

    public function doctorList(){
        $doctors = Doctor::with(['user','specialization'])->get();
        return response()->json($doctors);
    }
    public function specializations()
    {
        return response()->json(
            Specialization::select('id','name')->get()
        );
    }
    public function getBySpecialization($specializationId)
    {
        $services = Service::where('specialization_id', $specializationId)
            ->select('id','name','price','type')
            ->get();

        return response()->json($services);
    }

    public function getByDoctorsSpecialization($id)
    {
        $doctors = Doctor::where('specialization_id',$id)
            ->select('id','first_name','last_name','middle_name')
            ->get();

        return response()->json($doctors);
    }

    public function availableTimes($doctorId, Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json(['error' => 'Необхідна дата'], 422);
        }

        $doctor = Doctor::with('schedules')->findOrFail($doctorId);

        $dayOfWeek = Carbon::parse($date)->format('l');

        $schedule = $doctor->schedules()->where('day_of_week', $dayOfWeek)->first();

        if (!$schedule) {
            return response()->json([]);
        }

        $start = Carbon::parse($schedule->start_time);
        $end   = Carbon::parse($schedule->end_time);

        $busySlots = Appointment::where('doctor_id', $doctor->id)
            ->where('date', $date)
            ->pluck('time')
            ->map(fn($t) => Carbon::parse($t)->format('H:i'))
            ->toArray();

        $availableSlots = [];

        while ($start->lt($end)) {
            $timeStr = $start->format('H:i');
            if (!in_array($timeStr, $busySlots)) {
                $availableSlots[] = $timeStr;
            }
            $start->addMinutes(30);
        }

        return response()->json($availableSlots);
    }
}
