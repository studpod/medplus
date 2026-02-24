<?php

namespace App\Http\Controllers\Staff\Laborant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{User, Reception, Doctor, LabsResult};

class MainLabController extends Controller
{
    public function viewReception(){
        $user = auth()->user();

        $staff = Doctor::where('user_id', $user->id)->first();

        if (!$staff) {
            return response()->json([
                'error' => 'Мед працівника не знайдено'
            ], 404);
        }

        $receptions = Reception::with('patient')
            ->where('doctor_id', $staff->id)
            ->whereIn('status', ['expected', 'cancelled'])
            ->orderByRaw("CASE WHEN status = 'expected' THEN 0 WHEN status = 'cancelled' THEN 1 END")
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        return response()->json($receptions);
    }
    public function addLabsResult(Request $request)
    {
        $user = auth()->user();

        $staff = Doctor::where('user_id', $user->id)->first();

        $validated = $request->validate([
            'reception_id' => 'required|exists:receptions,id',
            'test_type'    => 'required|string',
            'test_name'    => 'required|string',
            'result'       => 'required|string',
            'comment'      => 'nullable|string'
        ]);

        $lab = LabsResult::create([
            'reception_id' => $validated['reception_id'],
            'performed_by' => $staff->id,
            'test_type'    => $validated['test_type'],
            'test_name'    => $validated['test_name'],
            'result'       => $validated['result'],
            'comment'      => $validated['comment'],
            'status'       => 'completed',
            'performed_at' => now(),
        ]);

        return response()->json($lab);
    }
}
