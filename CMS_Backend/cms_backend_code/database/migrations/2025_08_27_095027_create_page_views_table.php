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
        Schema::create('page_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->string('path', 255);
            $table->string('title', 255)->nullable();
            $table->timestampTz('entered_at');
            $table->timestampTz('left_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->timestampsTz();

            $table->foreign('session_id')->references('id')->on('activity_sessions')->cascadeOnDelete();
            $table->index(['session_id', 'entered_at']);
            $table->index(['session_id', 'left_at']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('page_views');
    }
};
