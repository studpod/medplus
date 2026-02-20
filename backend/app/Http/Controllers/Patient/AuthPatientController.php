<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;

class AuthPatientController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:6',
        ]);


        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'patient',
        ]);


        $verificationToken = Str::random(60);


        Mail::to($user->email)->send(new VerifyEmail($user, $verificationToken));

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Реєстрація успішна. На вашу пошту надіслано лист для підтвердження email.',
            'user' => $user,
            'token' => $token,
            'verification_token' => $verificationToken,
        ], 201);
    }
    public function verifyEmail(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Невірний користувач або токен'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email вже підтверджено']);
        }

        $user->email_verified_at = now();
        $user->save();

        return response()->json(['message' => 'Email успішно підтверджено']);
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


    public function logout()
    {
        try {
            auth()->logout();
            return response()->json(['message' => 'Вихід успішний']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Помилка при виході'], 500);
        }
    }
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Лист для відновлення паролю надіслано'])
            : response()->json(['error' => 'Помилка надсилання листа'], 500);
    }
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:6',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Пароль успішно змінено'])
            : response()->json(['error' => 'Невірний токен'], 400);
    }
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|confirmed|min:6',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Старий пароль невірний'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Пароль успішно змінено']);
    }
}


