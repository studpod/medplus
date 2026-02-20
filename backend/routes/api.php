<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Patient\AuthPatientController;
use App\Http\Controllers\Patient\PersonalOfficeController;
use App\Http\Controllers\Patient\ReceptionController;
use App\Http\Controllers\Doctor\AuthDoctorController;

Route::middleware(['auth:'])->get('/user', function (Request $request) {
    return $request->user();
});


Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthPatientController::class, 'register']); // api/auth/register
    Route::get('/verify-email', [AuthPatientController::class, 'verifyEmail']);
    Route::post('/login', [AuthPatientController::class, 'login']); // api/auth/login

    Route::post('/forgot-password', [AuthPatientController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthPatientController::class, 'resetPassword']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthPatientController::class, 'me']); // api/auth/me
        Route::post('/logout', [AuthPatientController::class, 'logout']); // api/auth/logout
        Route::post('/change-password', [AuthPatientController::class, 'changePassword']);
    });
});

Route::group(['prefix' => 'doctor/auth'], function () {
    Route::post('/login', [AuthDoctorController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthDoctorController::class, 'me']);
        Route::post('/logout', [AuthDoctorController::class, 'logout']);
    });
});

Route::middleware(['auth:api', 'role:patient'])
    ->prefix('patient')
    ->group(function () {

        // Route::get('/dashboard', [PersonalOfficeController::class, 'dashboard']);
        Route::prefix('view')->group(function () {
             Route::get('/profile',[PersonalOfficeController::class, 'viewProfile']); // api/patient/view/profile
             Route::get('/medical-records', [PersonalOfficeController::class, 'viewMedicalRecords']); // api/patient/view/medical-records
            Route::get('receptions', [PersonalOfficeController::class, 'viewReception']);
        });
        Route::prefix('control')->group(function(){
            Route::prefix('profile')->group(function(){
                Route::prefix('personal-info')->group(function(){
                    Route::post('/add', [PersonalOfficeController::class, 'addProfile']);
                    Route::put('/update', [PersonalOfficeController::class, 'updateProfile']);
                });
            });
            Route::prefix('reception')->group(function(){
                Route::post('/add', [ReceptionController::class, 'addReception']);
            });
        });
    });
