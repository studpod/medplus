<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class FirebaseAuth
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $idToken = substr($authHeader, 7);
        try {
            $apiKey = env('FIREBASE_API_KEY');
            $response = Http::post(
                "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={$apiKey}",
                ['idToken' => $idToken]
            );
            $data = $response->json();
            if (isset($data['error'])) {
                return response()->json(['error' => 'Invalid token'], 401);
            }
            $uid = $data['users'][0]['localId'];
            $email = $data['users'][0]['email'];
            $user = User::where('firebase_uid', $uid)->first();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 401);
            }
            $request->merge([
                'firebase_email' => $email
            ]);
            auth()->login($user);
            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
    }
}
