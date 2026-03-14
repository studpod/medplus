<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\FirebaseAuth;
use App\Http\Controllers\Patient\AuthPatientController;
use App\Http\Controllers\Patient\PersonalOfficeController;
use App\Http\Controllers\Patient\ReceptionController;
use App\Http\Controllers\Staff\AuthStaffController;
use App\Http\Controllers\Staff\Doctor\{MainController, PatientMedicalController};
use App\Http\Controllers\Staff\Laborant\{MainLabController};
use App\Http\Controllers\Staff\Receptionist\MainReceptionistController;
use App\Http\Controllers\PublicViewController;
use App\Http\Controllers\VideoSessionController;
use App\Models\User;



Route::middleware(['auth:'])->get('/user', function (Request $request) {
    return $request->user();
});


Route::middleware(FirebaseAuth::class)->group(function(){

    Route::post('/video/session',[VideoSessionController::class,'create']);

    Route::get('/video/session/{room}',
        [VideoSessionController::class,'get']
    );

});

Route::group(['prefix' => 'public/view'], function () {
    Route::prefix('/services')->group(function () {
        Route::get('', [PublicViewController::class, 'services']);
        Route::get('/{specializationId}', [PublicViewController::class, 'getBySpecialization']);
    });
   Route::prefix('/doctors')->group(function () {
       Route::get('/list', [PublicViewController::class, 'doctorList']);
       Route::get('/specialization/{id}', [PublicViewController::class, 'getByDoctorsSpecialization']);
       Route::get('/{doctor}/available-times', [PublicViewController::class, 'availableTimes']);
   });
   Route::get('/specializations', [PublicViewController::class, 'specializations']);

});

//Route::group(['prefix' => 'auth'], function () {
//    Route::post('/register', [AuthPatientController::class, 'register']); // api/auth/register
//    Route::get('/verify-email', [AuthPatientController::class, 'verifyEmail']);
//    Route::post('/login', [AuthPatientController::class, 'login']); // api/auth/login
//
//    Route::post('/forgot-password', [AuthPatientController::class, 'forgotPassword']);
//    Route::post('/reset-password', [AuthPatientController::class, 'resetPassword']);
//
//    Route::middleware('auth:api')->group(function () {
//        Route::get('/me', [AuthPatientController::class, 'me']); // api/auth/me
//        Route::post('/logout', [AuthPatientController::class, 'logout']); // api/auth/logout
//        Route::post('/change-password', [AuthPatientController::class, 'changePassword']);
//    });
//});

Route::prefix('auth')->group(function () {

    Route::post('/sync', function(Request $request) {
        $firebaseUser = $request->all(); // uid/email з React

        if (!isset($firebaseUser['uid']) || !isset($firebaseUser['email'])) {
            return response()->json(['error' => 'No Firebase user data provided'], 400);
        }

        $user = User::firstOrCreate(
            ['firebase_uid' => $firebaseUser['uid']],
            [
                'email' => $firebaseUser['email'],
                'role' => 'patient',
            ]
        );

        return response()->json($user);
    });

});

//Route::group(['prefix' => 'staff/auth'], function () {
//    Route::post('/login', [AuthStaffController::class, 'login']);
//
//    Route::middleware('auth:api', )->group(function () {
//        Route::get('/me', [AuthStaffController::class, 'me']);
//        Route::post('/logout', [AuthStaffController::class, 'logout']);
//    });
//});
Route::post('/staff/sync', function (Request $request) {

    $firebaseUser = $request->all();

    if (!isset($firebaseUser['uid']) || !isset($firebaseUser['email'])) {
        return response()->json(['error' => 'No Firebase user data provided'], 400);
    }

    $user = User::where('firebase_uid', $firebaseUser['uid'])->first();

    if (!$user) {
        return response()->json(['error' => 'User not registered in system'], 403);
    }

    if (!in_array($user->role, ['doctor','lab_technician','receptionist'])) {
        return response()->json(['error' => 'Access denied'], 403);
    }

    return response()->json($user);

});
Route::middleware([FirebaseAuth::class, 'role:patient'])
    ->prefix('patient')
    ->group(function () {

        // Route::get('/dashboard', [PersonalOfficeController::class, 'dashboard']);
        Route::prefix('view')->group(function () {
            Route::get('/me', [MainController::class, 'me']);
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

Route::middleware([FirebaseAuth::class, 'role:doctor'])
    ->prefix('doctor')
    ->group(function () {
       Route::prefix('view')->group(function (){
          Route::get('/schedule',[MainController::class, 'viewSchedule']);
          Route::get('/appointments', [MainController::class, 'viewReception']);
           Route::get('/calendar', [MainController::class, 'calendar']);
              Route::prefix('patient')->group(function(){
                  Route::get('/all', [MainController::class, 'viewPatients']);
                      Route::prefix('{patientId}')->group(function(){
                          Route::get('appointments', [MainController::class, 'getPatientAppointments']);
                        Route::get('/medical-card', [MainController::class, 'viewMedicalCard']);
                        Route::get('/labs-result', [MainController::class, 'viewLabsResult']);
                      });
              });

       });
       Route::prefix('control')->group(function(){
           Route::prefix('patient/{patientId}')->group(function(){
               Route::prefix('medical-card')->group(function(){
                   Route::post('/add', [PatientMedicalController::class, 'addMedicalCard']);
                   Route::put('/{recordId}/update', [PatientMedicalController::class, 'updateMedicalCard']);
               });
           });

           Route::put('/update-status-appointment/{appointmentId}/cancelled', [MainController::class, 'updateStatusAppointment']);
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
