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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reception_id')->constrained('receptions')->onDelete('cascade');
            $table->string('chief_complant');
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            $table->string('prescriptions')->nullable();
            $table->text('notes');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
//            $table->enum('status', ['active', 'recovered', 'chronic'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
