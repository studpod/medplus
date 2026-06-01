<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Models\{
    User,
    Doctor,
    Patient,
    Specialization,
    Service,
    Appointment,
    AppointmentService,
    AppointmentStatusLog,
    MedicalRecord,
    DoctorSchedules,
    LabsResult,
    LabsFile,
    Receptionist,
    VideoCall
};

class ModelsTest extends TestCase
{
    use RefreshDatabase;
    private function createBase()
    {
        $spec = Specialization::create([
            'name' => 'Therapy',
            'description' => 'Test'
        ]);
        $doctorUser = User::create([
            'firebase_uid' => 'doc_test',
            'role' => 'doctor'
        ]);
        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'specialization_id' => $spec->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'M',
            'phone' => '123'
        ]);
        $patientUser = User::create([
            'firebase_uid' => 'pat_test',
            'role' => 'patient'
        ]);
        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'doctor_id' => $doctor->id,
            'first_name' => 'Ann',
            'last_name' => 'Smith',
            'middle_name' => 'K',
            'gender' => 'female',
            'date_of_birth' => '2000-01-01',
            'phone' => '999',
            'address' => 'Street'
        ]);
        return compact('spec', 'doctor', 'patient');
    }


    public function test_user_roles()
    {
        $user = User::create([
            'firebase_uid' => 'u1',
            'role' => 'doctor'
        ]);
        $this->assertEquals('doctor', $user->role);
    }
    public function test_user_has_relations()
    {
        $base = $this->createBase();
        $this->assertInstanceOf(User::class, $base['doctor']->user);
        $this->assertInstanceOf(User::class, $base['patient']->user);
    }
    public function test_doctor_relations()
    {
        $base = $this->createBase();
        $doctor = $base['doctor'];
        $this->assertInstanceOf(Specialization::class, $doctor->specialization);
        $this->assertInstanceOf(User::class, $doctor->user);
    }

    public function test_doctor_has_schedules()
    {
        $base = $this->createBase();

        $schedule = DoctorSchedules::create([
            'doctor_id' => $base['doctor']->id,
            'day_of_week' => 'Monday',
            'start_time' => '08:00:00',
            'end_time' => '16:00:00'
        ]);

        $this->assertEquals($base['doctor']->id, $schedule->doctor_id);
    }

    public function test_appointment_creation_and_relations()
    {
        $base = $this->createBase();

        $appointment = Appointment::create([
            'patient_id' => $base['patient']->id,
            'doctor_id' => $base['doctor']->id,
            'date' => now()->addDay(),
            'time' => '10:00',
            'status' => 'expected',
            'is_online' => true
        ]);

        $this->assertInstanceOf(Patient::class, $appointment->patient);
        $this->assertInstanceOf(Doctor::class, $appointment->doctor);
    }

    public function test_appointment_service_relation()
    {
        $base = $this->createBase();

        $service = Service::create([
            'name' => 'Consultation',
            'description' => 'Test',
            'price' => 100,
            'specialization_id' => $base['spec']->id,
            'type' => 'consultation'
        ]);

        $appointment = Appointment::create([
            'patient_id' => $base['patient']->id,
            'doctor_id' => $base['doctor']->id,
            'date' => now(),
            'time' => '10:00',
            'status' => 'expected',
            'is_online' => false
        ]);

        $pivot = AppointmentService::create([
            'appointment_id' => $appointment->id,
            'service_id' => $service->id,
            'price' => 100
        ]);

        $this->assertEquals($appointment->id, $pivot->appointment_id);
    }

    public function test_status_log()
    {
        $base = $this->createBase();

        $appointment = Appointment::create([
            'patient_id' => $base['patient']->id,
            'doctor_id' => $base['doctor']->id,
            'date' => now(),
            'time' => '10:00',
            'status' => 'expected',
            'is_online' => false
        ]);

        $log = AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'old_status' => 'expected',
            'new_status' => 'completed',
            'changed_by' => $base['doctor']->user_id
        ]);

        $this->assertEquals($appointment->id, $log->appointment_id);
    }

    public function test_medical_record()
    {
        $base = $this->createBase();

        $appointment = Appointment::create([
            'patient_id' => $base['patient']->id,
            'doctor_id' => $base['doctor']->id,
            'date' => now(),
            'time' => '10:00',
            'status' => 'expected',
            'is_online' => false
        ]);

        $record = MedicalRecord::create([
            'appointment_id' => $appointment->id,
            'chief_complaint' => 'Pain',
            'anamnesis' => 'None',
            'diagnosis' => 'Healthy',
            'treatment' => 'Rest',
            'notes' => 'None'
        ]);

        $this->assertInstanceOf(Appointment::class, $record->appointment);
    }

    public function test_labs_flow()
    {
        $base = $this->createBase();

        $appointment = Appointment::create([
            'patient_id' => $base['patient']->id,
            'doctor_id' => $base['doctor']->id,
            'date' => now(),
            'time' => '10:00',
            'status' => 'expected',
            'is_online' => false
        ]);

        $service = Service::create([
            'name' => 'Blood Test',
            'description' => 'Test',
            'price' => 200,
            'specialization_id' => $base['spec']->id,
            'type' => 'lab_test'
        ]);

        $pivot = AppointmentService::create([
            'appointment_id' => $appointment->id,
            'service_id' => $service->id,
            'price' => 200
        ]);

        $lab = LabsResult::create([
            'appointment_service_id' => $pivot->id,
            'labNumber' => 123
        ]);

        $file = LabsFile::create([
            'lab_id' => $lab->id,
            'file_path' => '/test.pdf',
            'file_type' => 'pdf'
        ]);

        $this->assertEquals($lab->id, $file->lab_id);
    }

    public function test_video_call()
    {
        $base = $this->createBase();

        $appointment = Appointment::create([
            'patient_id' => $base['patient']->id,
            'doctor_id' => $base['doctor']->id,
            'date' => now(),
            'time' => '10:00',
            'status' => 'expected',
            'is_online' => true
        ]);

        $call = VideoCall::create([
            'appointment_id' => $appointment->id,
            'room_id' => 'room123',
            'status' => 'active'
        ]);

        $this->assertEquals($appointment->id, $call->appointment_id);
    }

    public function test_receptionist()
    {
        $user = User::create([
            'firebase_uid' => 'rec1',
            'role' => 'receptionist'
        ]);

        $rec = Receptionist::create([
            'user_id' => $user->id,
            'first_name' => 'Rec',
            'last_name' => 'User',
            'middle_name' => null,
            'phone' => '123'
        ]);

        $this->assertInstanceOf(User::class, $rec->user);
    }
}
