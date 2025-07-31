<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'images',
        'price',
        'discount_percentage',
        'category',
        'rating',
        'sku'
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'discount_percentage' => 'decimal:2', // Fixed: Added missing => operator
        'rating' => 'decimal:1',
    ];

    /**
     * Boot method untuk auto-generate SKU
     */
    protected static function boot()
    {
        parent::boot();

        // Event saat record baru dibuat
        static::creating(function ($product) {
            // Jika SKU belum diset, generate otomatis
            if (empty($product->sku)) {
                // Cari ID terakhir + 1
                $lastId = static::max('id') ?? 0;
                $nextId = $lastId + 1;
                
                // Generate SKU dengan format 4 digit (0001, 0002, dst)
                $product->sku = str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });

        // Event setelah record berhasil dibuat - update SKU berdasarkan ID sebenarnya
        static::created(function ($product) {
            // Update SKU berdasarkan ID yang sebenarnya dari database
            $actualSku = str_pad($product->id, 4, '0', STR_PAD_LEFT);
            
            // Update jika SKU berbeda (untuk memastikan konsistensi)
            if ($product->sku !== $actualSku) {
                $product->update(['sku' => $actualSku]);
            }
        });
    }

    /**
     * Accessor untuk mendapatkan image pertama
     */
    public function getFirstImageAttribute()
    {
        if (is_array($this->images) && count($this->images) > 0) {
            return $this->images[0];
        }
        return null;
    }

    /**
     * Accessor untuk format harga
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Accessor untuk mendapatkan harga setelah discount
     */
    public function getFinalPriceAttribute()
    {
        if ($this->discount_percentage && $this->discount_percentage > 0) {
            return $this->price - ($this->price * $this->discount_percentage / 100);
        }
        return $this->price;
    }

    /**
     * Accessor untuk mendapatkan harga final yang sudah diformat
     */
    public function getFormattedFinalPriceAttribute()
    {
        return 'Rp ' . number_format($this->final_price, 0, ',', '.');
    }

    /**
     * Accessor untuk mendapatkan jumlah penghematan
     */
    public function getSavingsAttribute()
    {
        if ($this->discount_percentage && $this->discount_percentage > 0) {
            return $this->price * $this->discount_percentage / 100;
        }
        return 0;
    }

    /**
     * Accessor untuk mendapatkan penghematan yang sudah diformat
     */
    public function getFormattedSavingsAttribute()
    {
        return 'Rp ' . number_format($this->savings, 0, ',', '.');
    }

    /**
     * Accessor untuk cek apakah produk memiliki discount
     */
    public function getHasDiscountAttribute()
    {
        return $this->discount_percentage && $this->discount_percentage > 0;
    }

    /**
     * Accessor untuk mendapatkan discount percentage yang sudah diformat
     */
    public function getFormattedDiscountAttribute()
    {
        if ($this->has_discount) {
            return $this->discount_percentage . '%';
        }
        return '0%';
    }

    /**
     * Scope untuk produk yang memiliki discount
     */
    public function scopeWithDiscount($query)
    {
        return $query->where('discount_percentage', '>', 0);
    }

    /**
     * Scope untuk produk berdasarkan kategori
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope untuk produk dengan harga dalam range tertentu
     */
    public function scopePriceRange($query, $minPrice = null, $maxPrice = null)
    {
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }
        return $query;
    }
}