<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoCall extends Model
{
    protected $fillable=[
        'appointment_id',
        'room_id',
        'status'
        ];
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
