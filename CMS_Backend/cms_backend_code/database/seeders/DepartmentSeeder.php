<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::create([
            'name' => 'Information Technology',
            'country' => 'Lebanon',
            'city' => 'Beirut',
            'director_id' => UserSeeder::$adminUser->id,
        ]);
    }
}
