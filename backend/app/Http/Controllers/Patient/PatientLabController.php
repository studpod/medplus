<?php

namespace App\Http\Controllers\Patient;
use App\Models\{Patient, LabsFile,LabsResult};
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PatientLabController extends Controller
{
    public function getPatientLabs(Request $request)
    {
        $patient = auth()->user()->patient;

        $query = LabsResult::with([
            'appointmentService.service',
            'appointmentService.appointment.doctor',
            'labsFiles'
        ])
            ->whereHas('appointmentService.appointment', function ($q) use ($patient) {
                $q->where('patient_id', $patient->id);
            });


        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }


        $sort = $request->get('sort', 'desc');
        $query->orderBy('created_at', $sort);

        $labs = $query->get();

        return response()->json([
            'labs' => $labs
        ]);
    }

}
