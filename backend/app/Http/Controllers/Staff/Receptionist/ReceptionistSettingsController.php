<?php

namespace App\Http\Controllers\Staff\Receptionist;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReceptionistSettingsController extends Controller
{
    public function me()
    {
        $user = auth()->user();

        $receptionist = $user->receptionist;

        if (!$receptionist) {
            return response()->json([
                'error' => 'Працівника не знайдено'
            ], 404);
        }

        return response()->json([
            'receptionist' => $receptionist
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $receptionist = $user->receptionist;

        if (!$receptionist) {
            return response()->json([
                'error' => 'Працівника не знайдено'
            ], 404);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',

            'phone' => [
                'required',
                'string',
                'max:13',
                'unique:receptionists,phone,' . $receptionist->id
            ],
        ]);

        $receptionist->update($validated);

        return response()->json([
            'message' => 'Профіль оновлено'
        ]);
    }
}
