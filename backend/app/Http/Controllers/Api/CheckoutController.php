<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataPembeli;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        // Validasi data yang diterima
        $validator = Validator::make($request->all(), [
            // Shipping Address
            'shippingAddress.name' => 'required|string|max:255',
            'shippingAddress.phone' => 'required|string|max:20',
            'shippingAddress.country' => 'required|string|max:100',
            'shippingAddress.address' => 'required|string',
            'shippingAddress.zipCode' => 'required|string|max:10',
            'shippingAddress.province' => 'required|string|max:100',
            'shippingAddress.regency' => 'required|string|max:100',
            'shippingAddress.district' => 'required|string|max:100',
            'shippingAddress.subdistrict' => 'required|string|max:100',
            
            // Payment & Shipping
            'paymentMethod' => 'required|string|in:bca,mandiri,bri,alfamart,gopay',
            'shipping.method' => 'required|string|in:reguler,ninja',
            'shipping.cost' => 'required|numeric|min:0',
            'shipping.isFree' => 'boolean',
            'insurance.selected' => 'boolean',
            'insurance.cost' => 'required|numeric|min:0',
            
            // Items
            'items' => 'required|array|min:1',
            'items.*.id' => 'required',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            
            // Totals
            'totals.subtotalBeforeVoucher' => 'required|numeric|min:0',
            'totals.totalVoucherDiscount' => 'numeric|min:0',
            'totals.finalTotal' => 'required|numeric|min:0',
            'totals.grandTotal' => 'required|numeric|min:0',
            
            // Flags
            'isBuyNow' => 'boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $validatedData = $validator->validated();
            
            // Hitung total items
            $totalItems = collect($validatedData['items'])->sum('quantity');
            
            // Siapkan data untuk disimpan
            $dataPembeli = DataPembeli::create([
                // Shipping Address
                'name' => $validatedData['shippingAddress']['name'],
                'phone' => $validatedData['shippingAddress']['phone'],
                'country' => $validatedData['shippingAddress']['country'],
                'address' => $validatedData['shippingAddress']['address'],
                'zip_code' => $validatedData['shippingAddress']['zipCode'],
                'province' => $validatedData['shippingAddress']['province'],
                'regency' => $validatedData['shippingAddress']['regency'],
                'district' => $validatedData['shippingAddress']['district'],
                'subdistrict' => $validatedData['shippingAddress']['subdistrict'],
                
                // Payment & Shipping
                'payment_method' => $validatedData['paymentMethod'],
                'shipping_method' => $validatedData['shipping']['method'],
                'shipping_cost' => $validatedData['shipping']['cost'],
                'is_shipping_free' => $validatedData['shipping']['isFree'] ?? false,
                'use_insurance' => $validatedData['insurance']['selected'] ?? false,
                'insurance_cost' => $validatedData['insurance']['cost'],
                
                // Items & Vouchers (JSON)
                'items' => $validatedData['items'],
                'vouchers' => $validatedData['vouchers'] ?? null,
                
                // Pricing
                'subtotal_before_voucher' => $validatedData['totals']['subtotalBeforeVoucher'],
                'total_voucher_discount' => $validatedData['totals']['totalVoucherDiscount'] ?? 0,
                'final_total' => $validatedData['totals']['finalTotal'],
                'total_items' => $totalItems,
                'grand_total' => $validatedData['totals']['grandTotal'],
                
                // Additional Info
                'notes' => $validatedData['notes'],
                'is_buy_now' => $validatedData['isBuyNow'] ?? false,
                'status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Checkout berhasil disimpan',
                'data' => [
                    'id' => $dataPembeli->id,
                    'order_number' => 'ORD-' . str_pad($dataPembeli->id, 6, '0', STR_PAD_LEFT),
                    'status' => $dataPembeli->status,
                    'grand_total' => $dataPembeli->grand_total
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $dataPembeli = DataPembeli::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $dataPembeli
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
    }
}