<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Patient\AuthPatientController;

Route::middleware(['auth:'])->get('/user', function (Request $request) {
    return $request->user();
});
 

Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthPatientController::class, 'register']); // api/auth/register
    Route::post('/login', [AuthPatientController::class, 'login']); // api/auth/login

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthPatientController::class, 'me']); // api/auth/me 
        Route::post('/logout', [AuthPatientController::class, 'logout']); // api/auth/logout
    });
});
