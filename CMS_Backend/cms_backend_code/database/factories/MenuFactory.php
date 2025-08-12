<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Menu;

class MenuFactory extends Factory
{
    protected $model = Menu::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->words(2, true);

        return [
            'title'       => ucfirst($title),
            'route'       => '/' . Str::slug($title),
            'order'       => $this->faker->numberBetween(1, 50),
            'parent_id'   => null,
            'status'      => $this->faker->randomElement(['draft','published','archived']),
            'published_at'=> $this->faker->optional(0.5)->dateTimeBetween('-1 year','now'),
        ];
    }
}
