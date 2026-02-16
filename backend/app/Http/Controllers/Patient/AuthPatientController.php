<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthPatientController extends Controller
{
     public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:6',
        ]);

        // Створюємо користувача з роллю "пацієнт"
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'patient',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Реєстрація успішна',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

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

            // Перевіряємо, що користувач є пацієнтом
            if ($user->role !== 'patient') {
                return response()->json(['error' => 'Доступ дозволено тільки пацієнтам'], 403);
            }

        } catch (JWTException $e) {
            return response()->json(['error' => 'Помилка при створенні токена'], 500);
        }

        return response()->json([
            'message' => 'Вхід успішний',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Вихід (деактивація токена)
     */
    public function logout()
    {
        try {
            auth()->logout();
            return response()->json(['message' => 'Вихід успішний']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Помилка при виході'], 500);
        }
    }
}


