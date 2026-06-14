<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentStatusLog extends Model
{
    protected $fillable = [
        'appointment_id',
        'old_status',
        'new_status',
        'changed_by'
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
