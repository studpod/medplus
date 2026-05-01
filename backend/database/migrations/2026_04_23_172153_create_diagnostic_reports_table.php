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
        Schema::create('diagnostic_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_service_id')
                ->constrained()
                ->cascadeOnDelete();

            // 📋 що саме робили (опис процесу)
            $table->text('description')->nullable();

            // 📊 результати (сирі медичні дані)
            $table->text('results')->nullable();

            // 🧾 фінальний висновок лікаря
            $table->text('conclusion')->nullable();

            // 💡 рекомендації після діагностики
            $table->text('recommendations')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostic_reports');
    }
};
