<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $fillable = [
      'user_id',
        'specialization_id',
        'last_name',
        'first_name',
        'middle_name',
        'phone',
        'avatar',

    ];
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
