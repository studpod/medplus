<?php

namespace App\Http\Controllers\Staff\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Doctor, DoctorSchedules, User};
use Illuminate\Support\Facades\DB;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Factory;

class MedPersonalController extends Controller
{
    public function getDoctors(Request $request)
    {
        $query = Doctor::with(['specialization', 'schedules']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%")
                    ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        if ($request->specialization_id) {
            $query->where('specialization_id', $request->specialization_id);
        }

        return response()->json([
            'doctors' => $query->latest()->get()
        ]);
    }
    public function addDoctor(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'phone' => 'required|string',
            'specialization_id' => 'required|exists:specializations,id',
        ]);

        /*
        |--------------------------------------------------------------------------
        | CHECK USER EXISTS
        |--------------------------------------------------------------------------
        */

        $existingUser = User::where(
            'firebase_uid',
            $request->firebase_uid
        )->first();

        if ($existingUser) {
            return response()->json([
                'message' => 'Користувач вже існує'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE USER
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'firebase_uid' => $request->firebase_uid,
            'role' => 'doctor'
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREATE DOCTOR
        |--------------------------------------------------------------------------
        */

        $doctor = Doctor::create([
            'user_id' => $user->id,

            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,

            'phone' => $request->phone,

            'specialization_id' => $request->specialization_id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREATE SCHEDULE
        |--------------------------------------------------------------------------
        */

        foreach ($request->schedule ?? [] as $s) {

            DoctorSchedules::create([
                'doctor_id' => $doctor->id,

                'day_of_week' => $s['day_of_week'],
                'start_time' => $s['start_time'],
                'end_time' => $s['end_time'],
            ]);
        }

        return response()->json([
            'message' => 'Лікаря створено',
            'doctor' => $doctor
        ]);
    }
    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'phone' => 'required|string',
            'specialization_id' => 'required|exists:specializations,id',

            'schedule' => 'array',
        ]);

        DB::beginTransaction();

        try {

            $doctor->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'phone' => $validated['phone'],
                'specialization_id' => $validated['specialization_id'],
            ]);


            DoctorSchedules::where('doctor_id', $doctor->id)->delete();

            if (!empty($validated['schedule'])) {

                foreach ($validated['schedule'] as $item) {

                    DoctorSchedules::create([
                        'doctor_id' => $doctor->id,
                        'day_of_week' => $item['day_of_week'],
                        'start_time' => $item['start_time'],
                        'end_time' => $item['end_time'],
                    ]);
                }
            }

            DB::commit();

            return response()->json($doctor->load('specialization'));

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        Doctor::findOrFail($id)->delete();

        return response()->json(['message' => 'deleted']);
    }
}
