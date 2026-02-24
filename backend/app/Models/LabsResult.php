<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabsResult extends Model
{
    protected $fillable = [
         'reception_id' ,
            'performed_by',
            'test_type',
            'test_name',
            'result',
            'comment',
            'status',
            'performed_at'
    ];
    public function reception()
    {
        return $this->belongsTo(Reception::class);
    }
}
