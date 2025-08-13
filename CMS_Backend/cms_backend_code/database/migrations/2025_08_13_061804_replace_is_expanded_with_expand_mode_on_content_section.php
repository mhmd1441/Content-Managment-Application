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
        Schema::table('contentSection', function (Blueprint $table) {
            if (Schema::hasColumn('contentSection', 'is_expanded')) {
                $table->dropColumn('is_expanded');
            }
            $table->enum('expand_mode', ['expanded', 'collapsed', 'free'])
                ->default('collapsed')
                ->after('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contentSection', function (Blueprint $table) {
            $table->boolean('is_expanded')->default(false)->after('order');
            $table->dropColumn('expand_mode');
        });
    }
};
