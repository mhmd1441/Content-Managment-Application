<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ActivitySession extends Model {
    use HasUuids;
    protected $table = 'activity_sessions';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id','user_id','tab_id','parent_path','started_at','last_seen_at','ended_at','end_reason','ip','user_agent'
    ];
    protected $casts = [
        'started_at'  => 'datetime',
        'last_seen_at'=> 'datetime',
        'ended_at'    => 'datetime',
    ];
}

