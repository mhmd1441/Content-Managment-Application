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

        $parents = Menu::factory()
            ->count(5)
            ->sequence(fn($s) => ['order' => $s->index + 1, 'parent_id' => null])
            ->create();

        foreach ($parents as $p) {
            Menu::factory()
                ->count(rand(2, 4))
                ->sequence(fn($s) => ['order' => $s->index + 1, 'parent_id' => $p->id])
                ->create();
        }
    }
}
