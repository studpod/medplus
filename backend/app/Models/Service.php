<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'doctor_id',
        'type'
    ];
   public $timestamps = false;
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
