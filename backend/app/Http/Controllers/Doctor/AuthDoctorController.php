<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;


class AuthDoctorController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Невірні дані для входу'], 401);
            }

            $user = auth()->user();


            if ($user->role !== 'doctor') {
                return response()->json(['error' => 'Доступ дозволено тільки лікарям'], 403);
            }

        } catch (JWTException $e) {
            return response()->json(['error' => 'Помилка при створенні токена'], 500);
        }

        return response()->json([
            'message' => 'Вхід лікаря успішний',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me()
    {
        return response()->json(auth()->user());
    }

    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Вихід виконано']);
    }

}
