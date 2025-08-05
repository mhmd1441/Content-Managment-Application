<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parentMenu = Menu::create([
            'title' => 'Product And Services',
            'route' => '/productsAndServices',
            'order' => 1,
            'status' => 'published',
            'parent_id' => null,
        ]);

        Menu::create([
            'title' => 'Projects',
            'route' => '/projects',
            'order' => 2,
            'status' => 'published',
            'parent_id' => $parentMenu->id,
        ]);
    }
}
