<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'name',
        'type',
        'value',
        'min_purchase',
        'max_uses',
        'used_count',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function getFormattedValueAttribute()
{
    if ($this->type === 'percent') {
        return number_format($this->value, 0) . '%';
    } elseif ($this->type === 'fixed') {
        return 'Rp' . number_format($this->value, 0, ',', '.');
    }

    return $this->value;
}
}
