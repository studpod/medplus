<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    protected $fillable=[
       'from_doctor_id',
        'patient_id',
        'to_specialization_id',
        'reason'
    ];
    public function specialization()
    {
        return $this->belongsTo(Specialization::class, 'to_specialization_id');
    }
}
