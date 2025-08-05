<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class content_sections extends Model
{
    protected $fillable = [
        'subtitle',
        'description',
        'image_path',
        'order',
        'is_expanded',
        'status',
        'parent_id',
        'menu_id'

    ];
    public function menu(): HasOne
    {
        return $this->HasOne(Menu::class, 'menu_id');
    }
    public function parent(): HasOne
    {
        return $this->HasOne(Menu::class, 'parent_id');
    }
}
