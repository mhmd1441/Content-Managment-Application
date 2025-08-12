<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class ContentSection extends Model
{
    use HasFactory;

    protected $table = 'contentSection';

    protected $fillable = [
        'subtitle','description','image_path','order','is_expanded','status',
        'published_at','parent_id','menu_id','created_by','updated_by',
    ];
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(contentSection::class, 'parent_id');
    }
}
