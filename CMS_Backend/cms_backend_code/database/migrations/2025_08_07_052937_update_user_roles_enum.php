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
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['super_admin', 'business_admin', 'business_user'])->default('business_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop new enum
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['full-access', 'view-only'])->default('view-only');
        });
    }
};
