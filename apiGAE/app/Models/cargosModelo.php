<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class cargosModelo extends Model
{
    use HasFactory;  
    protected $table = 'cargos';
    public $timestamps = false;
    protected $primaryKey = 'id_cargo';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_cargo',
        'nombre_cargo'
    ];
    
}
