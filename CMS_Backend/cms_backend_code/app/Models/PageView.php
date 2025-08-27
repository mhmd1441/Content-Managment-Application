<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PageView extends Model {
    use HasUuids;
    protected $table = 'page_views';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id','session_id','path','title','entered_at','left_at','duration_seconds'
    ];
    protected $casts = [
        'entered_at' => 'datetime',
        'left_at'    => 'datetime',
    ];
}
