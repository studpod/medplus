<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable=[
        'patient_id',
        'doctor_id',
        'reception_type',
        'date',
        'time',
        'status',
        ];
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function medicalRecord()
    {
        return $this->hasOne(MedicalRecord::class);
    }

    public function appointmentServices()
    {
        return $this->hasMany(AppointmentService::class);
    }
    public function services()
    {
        return $this->belongsToMany(Service::class, 'appointment_services', 'appointment_id', 'service_id')
            ->withPivot('price');
    }
    public function statusLogs()
    {
        return $this->hasMany(AppointmentStatusLog::class);
    }
}
