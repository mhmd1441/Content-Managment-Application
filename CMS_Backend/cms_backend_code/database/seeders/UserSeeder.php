<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public static $adminUser;

    public function run(): void
    {
        self::$adminUser = User::create([
            'first_name' => 'Mhmd',
            'last_name' => 'Moumneh',
            'job_title' =>   'Admin',
            'phone_number' => '70740676',
            'email' => 'mmoumneh14@gmail.com',
            'password' => Hash::make('Mohamad123'),
            'status' => 'active',
            'role' => 'full-access',
            'email_verified_at' => now(),
        ]);
    }
}
