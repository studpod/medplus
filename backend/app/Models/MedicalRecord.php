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
    // Отримати всі лабораторні результати через AppointmentsSection → AppointmentService → LabsResult
    public function labsResults()
    {
        return $this->hasManyThrough(
            LabsResult::class,         // кінцева модель
            AppointmentService::class, // проміжна модель
            'appointment_id',          // ключ у appointment_services, що зв'язує з appointment
            'appointment_service_id',  // ключ у labs_results, що зв'язує з appointment_service
            'appointment_id',          // локальний ключ у medical_records → appointment
            'id'                       // локальний ключ у appointment_services
        )->with('labsFiles'); // відразу підвантажуємо файли
    }

}
