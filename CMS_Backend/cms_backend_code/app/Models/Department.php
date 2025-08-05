<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'country',
        'city',
        'director_id',
    ];
    public function director(): HasOne
    {
        return $this->HasOne(User::class, 'director_id');
    }
}
