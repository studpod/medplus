<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
        'appointment_id',
        'chief_complaint',
        'anamnesis',
        'initial_review',
        'diagnosis',
        'treatment',
        'prescriptions',
        'notes',
        'start_date',
        'end_date',
        'status',
    ];
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function labsResults()
    {
        return $this->hasManyThrough(
            LabsResult::class,
            AppointmentService::class,
            'appointment_id',
            'appointment_service_id',
            'appointment_id',
            'id'
        )->with('labsFiles');
    }

}
