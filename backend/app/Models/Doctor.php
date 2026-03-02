<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }
    public function schedules()
    {
        return $this->hasMany(DoctorSchedules::class);
    }
    public function appointment()
    {
        return $this->hasMany(Appointment::class);
    }
}
