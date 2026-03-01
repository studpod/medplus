<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
        'appointment_id',
        'chief_complaint',
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
        return $this->hasMany(LabsResult::class);
    }
}
