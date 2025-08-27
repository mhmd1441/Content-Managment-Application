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
        Schema::create('activity_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('tab_id', 64);
            $table->string('parent_path', 64)->nullable();
            $table->timestampTz('started_at');
            $table->timestampTz('last_seen_at')->index();
            $table->timestampTz('ended_at')->nullable()->index();
            $table->enum('end_reason', ['logout','timeout','unload','navigate_away','unknown'])->nullable()->index();
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampsTz();

            $table->index(['user_id', 'tab_id']);
            $table->index(['user_id', 'started_at']);
            // helps find "open" by (user, tab)
            $table->index(['user_id', 'tab_id', 'ended_at']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('activity_sessions');
    }
};
