<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiagnosticReport extends Model
{
    protected $fillable = [
        'appointment_service_id',
        'description',
        'results',
        'conclusion',
        'recommendations'
    ];
    public function files()
    {
        return $this->hasMany(DiagnosticFile::class);
    }
    public function appointmentService()
    {
        return $this->belongsTo(AppointmentService::class);
    }
}
