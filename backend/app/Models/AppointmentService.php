<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentService extends Model
{
    public $timestamps = false;
    protected $fillable=[
        'appointment_id',
        'service_id',
        'price',

    ];
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
    public function labsResults()
    {
        return $this->hasMany(LabsResult::class);
    }



}
