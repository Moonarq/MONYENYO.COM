<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class DataPembeli extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'country',
        'address',
        'zip_code',
        'province',
        'regency',
        'district',
        'subdistrict',
        'payment_method',
        'shipping_method',
        'shipping_cost',
        'is_shipping_free',
        'use_insurance',
        'insurance_cost',
        'notes',
        'items',
        'vouchers',
        'subtotal_before_voucher',
        'total_voucher_discount',
        'final_total',
        'total_items',
        'grand_total',
        'status',
        'is_buy_now'
    ];

    protected $casts = [
        'items' => 'array',
        'vouchers' => 'array',
        'shipping_cost' => 'decimal:2',
        'insurance_cost' => 'decimal:2',
        'subtotal_before_voucher' => 'decimal:2',
        'total_voucher_discount' => 'decimal:2',
        'final_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'is_shipping_free' => 'boolean',
        'use_insurance' => 'boolean',
        'is_buy_now' => 'boolean',
    ];

    // Accessor untuk format mata uang
    protected function formattedGrandTotal(): Attribute
    {
        return Attribute::make(
            get: fn () => 'Rp ' . number_format($this->grand_total, 0, ',', '.')
        );
    }

    protected function formattedSubtotal(): Attribute
    {
        return Attribute::make(
            get: fn () => 'Rp ' . number_format($this->subtotal_before_voucher, 0, ',', '.')
        );
    }

    // Accessor untuk alamat lengkap
    protected function fullAddress(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->address}, {$this->subdistrict}, {$this->district}, {$this->regency}, {$this->province} {$this->zip_code}"
        );
    }

    // Accessor untuk payment method label
    protected function paymentMethodLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => match($this->payment_method) {
                'bca' => 'BCA Virtual Account',
                'mandiri' => 'Mandiri Virtual Account',
                'bri' => 'BRI Virtual Account',
                'alfamart' => 'Alfamart/Alfamidi/Lawson',
                'gopay' => 'GoPay',
                default => ucfirst($this->payment_method)
            }
        );
    }

    // Accessor untuk shipping method label
    protected function shippingMethodLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => match($this->shipping_method) {
                'reguler' => 'Reguler (Free)',
                'ninja' => 'Ninja Xpress',
                default => ucfirst($this->shipping_method)
            }
        );
    }

    // Scope untuk filter berdasarkan status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope untuk filter buy now orders
    public function scopeBuyNow($query)
    {
        return $query->where('is_buy_now', true);
    }

    // Scope untuk filter cart orders
    public function scopeCartOrders($query)
    {
        return $query->where('is_buy_now', false);
    }
}