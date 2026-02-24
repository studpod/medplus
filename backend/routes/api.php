<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Patient\AuthPatientController;
use App\Http\Controllers\Patient\PersonalOfficeController;
use App\Http\Controllers\Patient\ReceptionController;
use App\Http\Controllers\Staff\AuthStaffController;
use App\Http\Controllers\Staff\Doctor\{MainController, PatientMedicalController};
use App\Http\Controllers\Staff\Laborant\{MainLabController};
use App\Http\Controllers\Staff\Receptionist\MainReceptionistController;
use App\Http\Controllers\PublicViewController;



Route::middleware(['auth:'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['prefix' => 'public/view'], function () {
   Route::get('/services', [PublicViewController::class, 'services']);
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

Route::group(['prefix' => 'staff/auth'], function () {
    Route::post('/login', [AuthStaffController::class, 'login']);

    Route::middleware('auth:api', )->group(function () {
        Route::get('/me', [AuthStaffController::class, 'me']);
        Route::post('/logout', [AuthStaffController::class, 'logout']);
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

Route::middleware(['auth:api', 'role:doctor'])
    ->prefix('doctor')
    ->group(function () {
       Route::prefix('view')->group(function (){
          Route::get('/schedule',[MainController::class, 'viewSchedule']);
          Route::get('/reception', [MainController::class, 'viewReception']);
              Route::prefix('patient')->group(function(){
                  Route::get('/all', [MainController::class, 'viewPatients']);
                      Route::prefix('{patientId}')->group(function(){
                        Route::get('/medical-card', [MainController::class, 'viewMedicalCard']);
                        Route::get('/labs-result', [MainController::class, 'viewLabsResult']);
                      });
              });

       });
       Route::prefix('control')->group(function(){
           Route::prefix('patient/{patientId}')->group(function(){
                Route::post('/medical-card', [PatientMedicalController::class, 'addMedicalCard']);


           });
       });
    });

Route::middleware(['auth:api', 'role:lab_technician'])
    ->prefix('lab-technician')
    ->group(function () {
        Route::prefix('view')->group(function () {
            Route::get('/reception', [MainLabController::class, 'viewReception']);
        });
        Route::prefix('control')->group(function(){
           Route::post('/add/labs-result', [MainLabController::class, 'addLabsResult']);
        });
    });

Route::middleware(['auth:api', 'role:receptionist'])
    ->prefix('receptionist')
    ->group(function () {
       Route::prefix('view')->group(function () {
          Route::get('/patients', [MainReceptionistController::class, 'viewPatients']);
          Route::get('/receptions', [MainReceptionistController::class, 'viewReception']);
          Route::get('/doctors', [MainReceptionistController::class, 'viewDoctors']);

       });
       Route::prefix('control')->group(function(){
           Route::post('/add/patient', [MainReceptionistController::class, 'addPatient']);
           Route::post('/add/reception', [MainReceptionistController::class, 'addReception']);
       });
    });
