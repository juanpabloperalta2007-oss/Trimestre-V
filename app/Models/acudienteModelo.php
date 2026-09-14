<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

    
class acudienteModelo extends Model
{
    use HasFactory;  
    protected $table = 'acudientes';
    public $timestamps = false;
    protected $primaryKey = 'id_acudiente';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_acudiente',
        'id_persona',
        'direccion'
    ];  
}
