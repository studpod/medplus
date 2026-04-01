<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_doctor_id') // сімейний лікар
            ->constrained('doctors')
                ->cascadeOnDelete();
            $table->foreignId('patient_id') // пацієнт
            ->constrained('patients')
                ->cascadeOnDelete();
            $table->foreignId('to_specialization_id') // спеціаліст, куди направляють
            ->constrained('specializations')
                ->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
