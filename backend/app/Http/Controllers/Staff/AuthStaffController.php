<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthStaffController extends Controller
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

            // ✅ Дозволяємо тільки мед персонал і адміна
            if (!in_array($user->role, [
                'doctor',
                'lab_technician',
                'receptionist',
                'admin'
            ])) {
                auth()->logout();
                return response()->json(['error' => 'Доступ дозволено тільки персоналу'], 403);
            }

        } catch (JWTException $e) {
            return response()->json(['error' => 'Помилка при створенні токена'], 500);
        }

        return response()->json([
            'message' => 'Вхід персоналу успішний',
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
