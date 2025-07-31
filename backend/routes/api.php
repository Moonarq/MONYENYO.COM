<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\CheckoutController;

Route::get('/products', [ProductController::class, 'index']);

// Voucher routes
// Voucher routes
Route::prefix('vouchers')->group(function () {
    Route::get('/', [VoucherController::class, 'index']);
    Route::post('/validate', [VoucherController::class, 'validate']);
    Route::post('/apply', [VoucherController::class, 'apply']);
});

// Checkout routes (pisah dari vouchers!)
Route::prefix('checkout')->group(function () {
    Route::post('/', [CheckoutController::class, 'store']);
    Route::get('/{id}', [CheckoutController::class, 'show']);
});


