<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    public function referrals()
    {
        return $this->hasMany(Referral::class);
    }
}
