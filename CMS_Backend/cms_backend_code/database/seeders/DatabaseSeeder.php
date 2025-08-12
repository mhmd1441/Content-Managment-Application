<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use App\Models\contentSection;
use App\Models\Menu;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            DepartmentSeeder::class,
            MenuSeeder::class,
            ContentSectionSeeder::class,
        ]);

        User::factory(10)->create();
        Department::factory(10)->create();
        Menu::factory(10)->create();
        ContentSection::factory(15)->create();
    }
}
