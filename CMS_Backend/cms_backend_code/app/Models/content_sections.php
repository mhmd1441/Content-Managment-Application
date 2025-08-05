<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class content_sections extends Model
{
    protected $fillable = [
        'subtitle',
        'description',
        'image_path',
        'order',
        'is_expanded',
        'status',
        'published_at',
        'parent_id',
        'menu_id',
        'created_by',
        'updated_by'
    ];
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(content_sections::class, 'parent_id');
    }
}
