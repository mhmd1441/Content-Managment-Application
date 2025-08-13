<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ContentSection;
use App\Models\Menu;
use App\Models\User;
class ContentSectionFactory extends Factory
{
    protected $model = ContentSection::class;

    public function definition(): array
    {
        $imgs = [];
        if ($this->faker->boolean(70)) {
            $imgs[] = $this->faker->imageUrl(800, 600, 'business', true);
            if ($this->faker->boolean(50)) {
                $imgs[] = $this->faker->imageUrl(800, 600, 'tech', true);
            }
        }

        return [
            'subtitle'     => ucfirst($this->faker->words(3, true)),
            'description'  => $this->faker->paragraphs(mt_rand(1, 3), true),
            'image_path'   => implode(',', $imgs),
            'order'        => $this->faker->numberBetween(1, 20),
            'expand_mode'   => $this->faker->randomElement(['expanded','collapsed','free']),
            'status'       => $this->faker->randomElement(['draft','published','archived']),
            'published_at' => $this->faker->optional(0.6)->dateTimeBetween('-1 year','now'),
            'parent_id'    => null,
            'menu_id'      => Menu::query()->inRandomOrder()->value('id') ?? Menu::factory(),
            'created_by'   => User::inRandomOrder()->value('id'),
            'updated_by'   => null,
        ];
    }
}
