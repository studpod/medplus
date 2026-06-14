<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\FirebaseAuth;
use App\Http\Controllers\Patient\PersonalOfficeController;
use App\Http\Controllers\Patient\ReceptionController;
use App\Http\Controllers\Patient\PatientLabController;
use App\Http\Controllers\Staff\AuthStaffController;
use App\Http\Controllers\Staff\Doctor\{MainController,PatientController, AppointmentController, VideoConsultationController, PatientMedicalController};
use App\Http\Controllers\Staff\MainStaffController;
use App\Http\Controllers\Staff\Receptionist\{MainReceptionistController, ReceptionistAppointmentController, ReceptionistSettingsController};
use App\Http\Controllers\Staff\Admin\{MainAdminController, MedPersonalController};
use App\Http\Controllers\PublicViewController;
use App\Http\Controllers\VideoSessionController;
use App\Models\User;
use App\Models\Patient;
use function Pest\Laravel\get;
use Illuminate\Support\Facades\Log;



Route::middleware(['auth:'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/test-firebase', function () {
    return response()->json(['ok' => true]);
})->middleware(\App\Http\Middleware\FirebaseAuth::class);

//Route::middleware(FirebaseAuth::class)->group(function(){
//
//    Route::post('/video/session',[VideoSessionController::class,'create']);
//
//    Route::get('/video/session/{room}',
//        [VideoSessionController::class,'get']
//    );
//
//});

Route::group(['prefix' => 'public'], function () {
    Route::prefix('view')->group(function () {


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
    Route::prefix('control')->group(function () {
        Route::post('/reception/add-guest', [ReceptionController::class, 'addReceptionGuest']);
    });
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

//Route::prefix('auth')->group(function () {
//
//    Route::post('/sync', function(Request $request) {
//
//        $firebaseUser = $request->all();
//
//        if (!isset($firebaseUser['uid'])) {
//            return response()->json(['error' => 'No Firebase user data'], 400);
//        }
//
//        $user = User::firstOrCreate(
//            ['firebase_uid' => $firebaseUser['uid']],
//            [
//                'role' => 'patient',
//            ]
//        );
//
//        return response()->json($user);
//    });
//
//});
//Route::prefix('auth')->group(function () {
//
//    Route::post('/sync', function(Request $request) {
//
//        $firebaseUser = $request->all();
//
//        if (!isset($firebaseUser['uid'])) {
//            return response()->json([
//                'error' => 'No Firebase user data'
//            ], 400);
//        }
//
//        $user = User::firstOrCreate(
//            ['firebase_uid' => $firebaseUser['uid']],
//            [
//                'role' => 'patient',
//            ]
//        );
//
//        if ($user->role !== 'patient') {
//            return response()->json([
//                'error' => 'Access denied'
//            ], 403);
//        }
//
//        return response()->json($user);
//    });
//
//});

//врех акт

Route::prefix('auth')->group(function () {

    Route::post('/sync', function (Request $request) {

        Log::info('SYNC START', ['request' => $request->all()]);

        $uid = $request->input('uid');
        $email = $request->input('email');
        $phone = $request->input('phone');

        if (!$uid) {
            Log::error('NO UID');
            return response()->json(['error' => 'No UID'], 400);
        }

        $user = User::firstOrCreate(
            ['firebase_uid' => $uid],
            ['role' => 'patient']
        );

        Log::info('USER', ['id' => $user->id]);

        if ($phone) {

            $normalized = preg_replace('/\D+/', '', $phone);

            $patient = Patient::all()->first(function ($p) use ($normalized) {
                return preg_replace('/\D+/', '', $p->phone) === $normalized;
            });

            Log::info('PATIENT FOUND', [
                'found' => (bool) $patient
            ]);

            if ($patient) {
                $patient->user_id = $user->id;
                $patient->save();

                Log::info('LINKED SUCCESS', [
                    'patient_id' => $patient->id,
                    'user_id' => $user->id
                ]);
            }
        }

        return response()->json([
            'user' => $user,
            'linked' => (bool) $phone
        ]);
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
//Route::post('/staff/sync', function (Request $request) {
//
//    $firebaseUser = $request->all();
//
//    if (!isset($firebaseUser['uid']) || !isset($firebaseUser['email'])) {
//        return response()->json(['error' => 'No Firebase user data provided'], 400);
//    }
//
//    $user = User::where('firebase_uid', $firebaseUser['uid'])->first();
//
//    if (!$user) {
//        return response()->json(['error' => 'User not registered in system'], 403);
//    }
//
//    if (!in_array($user->role, ['doctor','lab_technician','receptionist'])) {
//        return response()->json(['error' => 'Access denied'], 403);
//    }
//
//    return response()->json($user);
//
//});



//Route::post('/staff/sync', function (Request $request) {
//    $firebaseUser = $request->all();
//    if (
//        !isset($firebaseUser['uid']) ||
//        !isset($firebaseUser['email'])
//    ) {
//        return response()->json([
//            'error' => 'No Firebase user data provided'
//        ], 400);
//    }
//    $user = User::where(
//        'firebase_uid',
//        $firebaseUser['uid']
//    )->first();
//    if (!$user) {
//        return response()->json([
//            'error' => 'User not registered in system'
//        ], 403);
//    }
//    if (!in_array($user->role, [
//        'doctor',
//        'receptionist',
//        'admin'
//    ])) {
//        return response()->json([
//            'error' => 'Access denied'
//        ], 403);
//    }
//
//    return response()->json($user);
//});

Route::post('/staff/sync', function (Request $request) {

    $user = auth()->user();

    if (!in_array($user->role, ['doctor', 'admin', 'receptionist'])) {
        return response()->json([
            'error' => 'Access denied'
        ], 403);
    }

    return response()->json($user);

})->middleware('firebase.auth');


Route::middleware([FirebaseAuth::class, 'role:patient'])
    ->prefix('patient')
    ->group(function () {
        Route::prefix('view')->group(function () {
            Route::get('/me', [PersonalOfficeController::class, 'me']);
             Route::get('/profile',[PersonalOfficeController::class, 'viewProfile']);
             Route::get('/medical-records', [PersonalOfficeController::class, 'viewMedicalRecords']);
            Route::get('receptions', [PersonalOfficeController::class, 'viewReception']);
            Route::get('/labs', [PatientLabController::class, 'getPatientLabs']);
        });
        Route::prefix('control')->group(function(){
            Route::prefix('profile')->group(function(){
                Route::prefix('personal-info')->group(function(){
                    Route::post('complete', [PersonalOfficeController::class, 'completeProfile']);
                    Route::post('/add', [PersonalOfficeController::class, 'addProfile']);
                    Route::put('/update', [PersonalOfficeController::class, 'updateProfile']);
                });
            });
            Route::prefix('reception')->group(function(){
                Route::post('/add', [ReceptionController::class, 'addReceptionAuth']);
            });
        });
    });


Route::middleware([FirebaseAuth::class])
    ->prefix('/staff')
    ->group(function () {
        Route::prefix('view')->group(function () {
            Route::get('/me', [MainStaffController::class, 'me']);
            Route::get(
                '/calendar',
                [MainReceptionistController::class, 'calendar']
            );
            Route::get(
                '/specializations',
                [MainReceptionistController::class, 'specializations']
            );
            Route::get(
                '/doctors-by-specialization/{id}',
                [MainReceptionistController::class, 'doctorsBySpecialization']
            );
        });
    });


Route::middleware([FirebaseAuth::class, 'role:doctor'])
    ->prefix('doctor')
    ->group(function () {
       Route::prefix('view')->group(function (){
          Route::get('/schedule',[MainController::class, 'viewSchedule']);
           Route::get('/me', [MainController::class, 'me']);
          Route::get('/appointments', [AppointmentController::class, 'viewReception']);
          Route::get('/appointments/online', [AppointmentController::class,'viewOnlineAppointments']);
           Route::get('/calendar', [MainController::class, 'calendar']);
           Route::get('/specializations', [MainController::class, 'getSpecializations']);
           Route::get('/profile', [MainController::class, 'getDoctorProfile']);
           Route::get('/appointment/{id}', [AppointmentController::class, 'getAppointment']);
           Route::get('/appointment-service/{id}', [AppointmentController::class, 'getAppointmentService']);
           Route::get('/lab_test', [MainController::class, 'getLabTest']);
           Route::get('appointment-services/by-patient/{patientId}', [AppointmentController::class, 'getAppointmentServicesByPatient']
           );
              Route::prefix('patient')->group(function(){
                  Route::get('/search', [PatientController::class, 'searchPatient']);
                  Route::get('/all', [PatientController::class, 'viewPatients']);
                      Route::prefix('{patientId}')->group(function(){
                          Route::get('appointments', [AppointmentController::class, 'getPatientAppointments']);
                          Route::get('/medical-card', [PatientMedicalController::class, 'viewMedicalCard']);
                      });
              });
       });
       Route::prefix('control')->group(function(){
           Route::put('/me/update', [MainController::class, 'updateMe']);
           Route::post('/me/avatar', [MainController::class, 'updateAvatar']);
           Route::get('/patient/assign', [PatientController::class, 'assignPatient']);
           Route::delete('/patient/unassign', [PatientController::class, 'unassignPatient']);
           Route::prefix('patient/{patientId}')->group(function(){

               Route::prefix('medical-card')->group(function(){
                   Route::post('/add', [PatientMedicalController::class, 'addMedicalCard']);
                   Route::put('/{recordId}/update', [PatientMedicalController::class, 'updateMedicalCard']);
                   Route::put('{id}', [PatientMedicalController::class, 'updateMedicalRecord']);
               });
           });
               Route::prefix('video-call')->group(function(){
                   Route::post('/start', [VideoConsultationController::class, 'startVideoCall']);
                   Route::put('/end', [VideoConsultationController::class, 'endVideoCall']);
                 });
           Route::post('/labs/create', [MainController::class, 'store']);
           Route::prefix('diagnostics')->group(function(){
               Route::post('/create', [AppointmentController::class, 'createDiagnostic']);
               Route::put('/{id}/update', [PatientMedicalController::class, 'updateDiagnostic']);
           });

           Route::put('/update-status-appointment/{appointmentId}/cancelled', [AppointmentController::class, 'updateStatusAppointment']);
           Route::post('/appointments/{id}/complete', [AppointmentController::class, 'completeAppointment']);
       });
    });

Route::middleware([FirebaseAuth::class, 'role:receptionist'])
    ->prefix('receptionist')
    ->group(function () {
       Route::prefix('view')->group(function () {
           Route::get('/me', [ReceptionistSettingsController::class, 'me']);
           Route::get('/patients', [MainReceptionistController::class, 'patients']);
           Route::get('/patients/search', [MainReceptionistController::class, 'searchPatients']);
           Route::get('/services-by-doctor/{id}', [MainReceptionistController::class, 'servicesByDoctor']);
           Route::get('/doctor-available-times', [MainReceptionistController::class, 'doctorAvailableTimes']);
           Route::get('/appointments', [ReceptionistAppointmentController::class, 'getReceptionistAppointments']);
           Route::get('/appointments/{id}', [ReceptionistAppointmentController::class, 'getReceptionistAppointment']);
           Route::get('/doctors', [MainReceptionistController::class, 'getDoctors']);
           Route::get('/patients', [MainReceptionistController::class, 'getPatients']);

       });
       Route::prefix('control')->group(function(){

       });
       Route::prefix('control')->group(function(){
           Route::post('/appointments/create', [ReceptionistAppointmentController::class, 'createAppointment']);
           Route::put('/appointments/{id}', [ReceptionistAppointmentController::class, 'updateAppointment']);
           Route::put('/patients/{id}', [MainReceptionistController::class, 'updatePatient']);
           Route::put('/me/update', [ReceptionistSettingsController::class, 'update']
           );
       });
    });

Route::middleware([FirebaseAuth::class, 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::prefix('view')->group(function () {
            Route::get('/dashboard-stats', [MainAdminController::class, 'dashboardStats']);
            Route::get('/doctors', [MedPersonalController::class, 'getDoctors']);
            Route::get('/specializations',[MainAdminController::class, 'getSpecializations']);
        });
        Route::prefix('control')->group(function(){
            Route::prefix('doctors')->group(function(){
                Route::post('/add', [MedPersonalController::class, 'addDoctor']);
                Route::put('/update/{id}', [MedPersonalController::class, 'update']);
                Route::delete('/delete/{id}', [MedPersonalController::class, 'destroy']);
            });
        });
    });



