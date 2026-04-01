<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabsResult extends Model
{
    protected $fillable = [
         'appointment_id' ,
        'labNumber',
        'appointment_service_id'

    ];
    public function appointmentService()
    {
        return $this->belongsTo(AppointmentService::class);
    }
    public function labsFiles()
    {
        return $this->hasMany(LabsFile::class, 'lab_id', 'id');
    }
}
