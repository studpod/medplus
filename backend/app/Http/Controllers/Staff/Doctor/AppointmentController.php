<?php

namespace App\Http\Controllers\Staff\Doctor;

use App\Http\Controllers\Controller;
use App\Models\{Appointment, Doctor, AppointmentService,AppointmentStatusLog, DiagnosticFile,DiagnosticReport};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function viewReception(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['error' => 'Профіль лікаря не знайдено'], 404);
        }

        $receptions = Appointment::with([
            'patient',
            'statusLogs.user',
            'appointmentServices.service'
        ])
            ->where('doctor_id', $doctor->id)


            ->where('is_online', false)

            ->orderByRaw("FIELD(status, 'expected', 'completed', 'cancelled')")
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        return response()->json([
            'doctor_id' => $doctor->id,
            'receptions' => $receptions
        ]);
    }
    public function viewOnlineAppointments()
    {
        $user = Auth::user();


        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json([
                'error' => 'Лікаря не знайдено'
            ], 404);
        }


        $appointments = Appointment::with('patient')
            ->where('doctor_id', $doctor->id)
            ->where('is_online', true)
            ->orderBy('date')
            ->orderBy('time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' =>
                        $appointment->patient->last_name . ' ' .
                        $appointment->patient->first_name . ' ' .
                        $appointment->patient->middle_name,

                    'date' => $appointment->date,
                    'time' => $appointment->time,
                    'status' => $appointment->status
                ];
            });

        return response()->json([
            'appointments' => $appointments
        ]);
    }

    public function getAppointment($id)
    {
        $appointment = Appointment::with([
            'patient',
            'doctor',
            'appointmentServices.service',
            'appointmentServices.labsResults.labsFiles',
            'appointmentServices.diagnosticReport',
            'medicalRecord'
        ])->findOrFail($id);

        return response()->json([
            'appointment' => $appointment
        ]);
    }

    public function getAppointmentService($id)
    {
        $appointmentService = AppointmentService::with([
            'service',
            'appointment.patient'
        ])->findOrFail($id);

        return response()->json($appointmentService);
    }
    public function getAppointmentServicesByPatient($patientId)
    {
        $services = AppointmentService::with(['service', 'appointment'])
            ->whereHas('appointment', function ($query) use ($patientId) {
                $query->where('patient_id', $patientId);
            })
            ->whereHas('service', function ($query) {
                $query->where('type', 'lab_test');
            })

            ->whereDoesntHave('labsResults')
            ->get();

        return response()->json([
            'services' => $services
        ]);
    }
    public function getPatientAppointments($patientId)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'doctor') {
            return response()->json([
                'error' => 'Доступ дозволений лише лікарям'
            ], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json([
                'error' => 'Профіль лікаря не знайдений'
            ], 404);
        }

        $appointments = Appointment::with('doctor')
            ->where('patient_id', $patientId)
            ->where('doctor_id', $doctor->id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'appointments' => $appointments
        ]);
    }

    public function updateStatusAppointment($appointmentId)
    {
        $appointment = Appointment::with('statusLogs')->find($appointmentId);

        if (!$appointment) {
            return response()->json(['error' => 'Прийом не знайдено'], 404);
        }


        $oldStatus = $appointment->status;
        $appointment->status = 'no_show';
        $appointment->save();

        //  лог
        $log = AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'old_status' => $oldStatus,
            'new_status' => 'no_show',
            'changed_by' => auth()->id()
        ]);


        $appointment->load('statusLogs.user');

        return response()->json([
            'message' => 'Статус оновлено',
            'logs' => $appointment->statusLogs
        ]);
    }
    public function completeAppointment($appointmentId)
    {
        $appointment = Appointment::with([
            'appointmentServices.service',
            'medicalRecord',
            'appointmentServices.labsResults',
            'appointmentServices.procedureLog',
            'appointmentServices.diagnosticReport'
        ])->find($appointmentId);

        if (!$appointment) {
            return response()->json(['error' => 'Прийом не знайдено'], 404);
        }

        if ($appointment->status !== 'expected') {
            return response()->json(['error' => 'Прийом вже завершено або скасовано'], 400);
        }

        $services = $appointment->appointmentServices;

        $hasConsultation = false;
        $hasProcedure = false;
        $hasDiagnostics = false;

        $procedureError = false;
        $diagnosticError = false;

        foreach ($services as $s) {
            $type = $s->service->type;

            if (in_array($type, ['consultation', 'checkup'])) {
                $hasConsultation = true;
            }

            if ($type === 'procedure') {
                $hasProcedure = true;

                if (!$s->procedureLog || !$s->procedureLog->is_done) {
                    $procedureError = true;
                }
            }

            if ($type === 'diagnostics') {
                $hasDiagnostics = true;

                if (!$s->diagnosticReport) {
                    $diagnosticError = true;
                }
            }
        }


        if ($hasConsultation && !$appointment->medicalRecord) {
            return response()->json([
                'error' => 'Потрібно заповнити медичну картку!'
            ], 422);
        }

        if ($procedureError) {
            return response()->json([
                'error' => 'Не всі процедури виконані!'
            ], 422);
        }

        if ($diagnosticError) {
            return response()->json([
                'error' => 'Не додано результати діагностики!'
            ], 422);
        }


        $oldStatus = $appointment->status;

        $appointment->status = 'completed';
        $appointment->save();

        AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'old_status' => $oldStatus,
            'new_status' => 'completed',
            'changed_by' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Прийом успішно завершено!'
        ]);
    }

    public function createDiagnostic(Request $request)
    {
        $validated = $request->validate([
            'appointment_service_id' => 'required|exists:appointment_services,id',
            'description' => 'nullable|string',
            'results' => 'nullable|string',
            'conclusion' => 'nullable|string',
            'recommendations' => 'nullable|string',

            'files.*' => 'nullable|file|max:10240',
        ]);

        DB::beginTransaction();

        try {
            // 1. створюємо діагностичний звіт
            $report = DiagnosticReport::create([
                'appointment_service_id' => $validated['appointment_service_id'],
                'description' => $validated['description'] ?? null,
                'results' => $validated['results'] ?? null,
                'conclusion' => $validated['conclusion'] ?? null,
                'recommendations' => $validated['recommendations'] ?? null,
            ]);

            // 2. файли (якщо є)
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {

                    $path = $file->store('diagnostics', 'public');

                    DiagnosticFile::create([
                        'diagnostic_report_id' => $report->id,
                        'file_path' => $path,
                        'file_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Діагностику створено',
                'report' => $report->load('files'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Помилка створення діагностики',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
