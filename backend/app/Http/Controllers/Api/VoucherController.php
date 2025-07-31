<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Carbon\Carbon;

class VoucherController extends Controller
{
    /**
     * Get all active vouchers
     */
    public function index()
    {
        $vouchers = Voucher::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', Carbon::now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', Carbon::now());
            })
            ->where(function ($query) {
                $query->whereNull('max_uses')
                    ->orWhereRaw('used_count < max_uses');
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($vouchers);
    }

    /**
     * Validate voucher code and return discount info
     */
    public function validate(Request $request)
    {
        $request->validate([
            'voucher_name' => 'required|string',
            'total_amount' => 'required|numeric|min:0'
        ]);

        $voucher = Voucher::where('name', $request->voucher_name)
            ->where('is_active', true)
            ->first();

        if (!$voucher) {
            return response()->json([
                'valid' => false,
                'message' => 'Voucher tidak ditemukan atau tidak aktif'
            ], 404);
        }

        // Check if voucher is within valid date range
        $now = Carbon::now();
        if ($voucher->start_date && $now->lt($voucher->start_date)) {
            return response()->json([
                'valid' => false,
                'message' => 'Voucher belum dapat digunakan'
            ], 400);
        }

        if ($voucher->end_date && $now->gt($voucher->end_date)) {
            return response()->json([
                'valid' => false,
                'message' => 'Voucher sudah kadaluarsa'
            ], 400);
        }

        // Check usage limit
        if ($voucher->max_uses && $voucher->used_count >= $voucher->max_uses) {
            return response()->json([
                'valid' => false,
                'message' => 'Voucher sudah mencapai batas penggunaan'
            ], 400);
        }

        // Check minimum purchase
        if ($voucher->min_purchase && $request->total_amount < $voucher->min_purchase) {
            return response()->json([
                'valid' => false,
                'message' => 'Minimal pembelian Rp ' . number_format($voucher->min_purchase, 0, ',', '.')
            ], 400);
        }

        // Calculate discount
        $discount = $this->calculateDiscount($voucher, $request->total_amount);

        return response()->json([
            'valid' => true,
            'voucher' => $voucher,
            'discount' => $discount,
            'message' => 'Voucher berhasil diterapkan!'
        ]);
    }

    /**
     * Calculate discount amount based on voucher type
     */
    private function calculateDiscount($voucher, $totalAmount)
    {
        switch ($voucher->type) {
            case 'percent':
                return ($totalAmount * $voucher->value) / 100;
            
            case 'fixed':
                return min($voucher->value, $totalAmount); // Don't exceed total amount
            
            case 'free_shipping':
                return 0; // Shipping discount will be handled separately
            
            default:
                return 0;
        }
    }

    /**
     * Apply voucher (increment usage count)
     */
    public function apply(Request $request)
    {
        $request->validate([
            'voucher_name' => 'required|string'
        ]);

        $voucher = Voucher::where('name', $request->voucher_name)
            ->where('is_active', true)
            ->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak ditemukan'
            ], 404);
        }

        // Increment usage count
        $voucher->increment('used_count');

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil digunakan',
            'voucher' => $voucher
        ]);
    }
}