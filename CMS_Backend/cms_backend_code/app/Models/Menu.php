<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Menu extends Model
{
    protected $fillable = [
        'title',
        'route',
        'order',
        'status',
        'parent_id',

    ];
    public function parent(): HasOne
    {
        return $this->HasOne(Menu::class, 'parent_id');
    }
}
