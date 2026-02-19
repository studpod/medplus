<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Patient\AuthPatientController;
use App\Http\Controllers\Patient\PersonalOfficeController;
use App\Http\Controllers\Doctor\AuthDoctorController;

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

Route::group(['prefix' => 'doctor/auth'], function () {

    Route::post('/login', [AuthDoctorController::class, 'login']);
    // api/doctor/auth/login

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
             Route::get('/reception', [PersonalOfficeController::class, 'reception']); // api/patient/view/appointments
             Route::get('/lab-results', [PersonalOfficeController::class, 'labResults']); // api/patient/view
            Route::get('receptions', [PersonalOfficeController::class, 'viewReception']);
        });
        Route::prefix('profile')->group(function(){
            Route::post('/add', [PersonalOfficeController::class, 'addProfile']); // api/patient/profile/add
            Route::put('/update', [PersonalOfficeController::class, 'updateProfile']); // api/patient/profile/update
        });

    });
