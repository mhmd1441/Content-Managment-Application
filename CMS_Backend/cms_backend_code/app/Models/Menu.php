<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Menu extends Model
{
    use  HasFactory;

    protected $fillable = [
        'title',
        'route',
        'order',
        'status',
        'published_at',
        'parent_id',
        'created_by',
        'updated_by'
    ];
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }
}
