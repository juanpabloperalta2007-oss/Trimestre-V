<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class areasModelo extends Model
{
    protected $table = 'areas';
    public $timestamps = false;
    protected $primaryKey = 'id_area';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_area',
        'nombre_area'
    ];
}
