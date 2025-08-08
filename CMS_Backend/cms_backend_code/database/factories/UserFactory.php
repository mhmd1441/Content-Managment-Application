<?php

namespace Database\Factories;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name'  => fake()->firstName(),
            'last_name'   => fake()->lastName(),
            'job_title'   => fake()->jobTitle(),
            'phone_number' => fake()->phoneNumber(),
            'status'      => fake()->randomElement(['active', 'inactive', 'suspended']),
            'role'        => fake()->randomElement(['super_admin', 'business_admin', 'business_user']),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
        ];
    }

}
