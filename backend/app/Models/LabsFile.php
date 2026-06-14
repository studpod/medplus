<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabsFile extends Model
{
    protected $fillable = [
        'lab_id',
        'file_path',
        'file_type',
    ];
    public function labsResult()
    {
        return $this->belongsTo(LabsResult::class, 'lab_id', 'id');
    }
}
