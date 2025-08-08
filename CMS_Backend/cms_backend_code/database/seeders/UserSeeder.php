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
    public static $businessUser;
    public static $user;


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
            'role' => 'super_admin',
            'email_verified_at' => now(),
        ]);

       self::$businessUser = User::create([
          'first_name' => 'business',
           'last_name' => 'user',
           'job_title' =>   'business user',
           'phone_number' => '81809597',
           'email' => 'moumneh14@gmail.com',
           'password' => Hash::make('business123'),
           'status' => 'active',
           'role' => 'business_admin',
           'email_verified_at' => now(),
        ]);

        self::$user = User::create([
            'first_name' => 'user',
            'last_name' => 'user',
            'job_title' =>   'user',
            'phone_number' => '01234567',
            'email' => 'mmoumneh1441@gmail.com',
            'password' => Hash::make('user123'),
            'status' => 'active',
            'role' => 'business_user',
            'email_verified_at' => now(),
        ]);
    }
}
