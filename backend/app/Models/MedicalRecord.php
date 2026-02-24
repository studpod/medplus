<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
        'reception_id',
        'chief_complaint',
        'diagnosis',
        'treatment',
        'prescriptions',
        'notes',
        'start_date',
        'end_date',
        'status',
    ];
    public function reception()
    {
        return $this->belongsTo(Reception::class);
    }
    public function labsResults()
    {
        return $this->hasMany(LabsResult::class);
    }
}
