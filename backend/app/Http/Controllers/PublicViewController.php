<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;

class PublicViewController extends Controller
{
    public function services(){
        $services = Service::with('doctor')->get();

        return response()->json([
            'services' => $services
        ]);
    }
}
