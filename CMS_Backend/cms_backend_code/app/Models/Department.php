<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
    public function director(): BelongsTo
    {
        return $this->belongsTo(User::class, 'director_id');
    }
}
