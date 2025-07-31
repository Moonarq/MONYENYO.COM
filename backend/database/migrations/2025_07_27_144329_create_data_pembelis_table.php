<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('data_pembelis', function (Blueprint $table) {
            $table->id();
            
            // Shipping Address Information
            $table->string('name');
            $table->string('phone');
            $table->string('country')->default('Indonesia');
            $table->text('address');
            $table->string('zip_code');
            $table->string('province');
            $table->string('regency');
            $table->string('district');
            $table->string('subdistrict');
            
            // Order Information
            $table->string('payment_method');
            $table->string('shipping_method');
            $table->decimal('shipping_cost', 10, 2);
            $table->boolean('is_shipping_free')->default(false);
            $table->boolean('use_insurance')->default(false);
            $table->decimal('insurance_cost', 10, 2)->default(0);
            $table->text('notes')->nullable();
            
            // Order Items (JSON format untuk menyimpan items)
            $table->json('items');
            
            // Vouchers (JSON format untuk menyimpan voucher info)
            $table->json('vouchers')->nullable();
            
            // Pricing Information
            $table->decimal('subtotal_before_voucher', 12, 2);
            $table->decimal('total_voucher_discount', 10, 2)->default(0);
            $table->decimal('final_total', 12, 2);
            $table->integer('total_items');
            $table->decimal('grand_total', 12, 2);
            
            // Order Status
            $table->enum('status', ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])
                  ->default('pending');
            
            // Buy Now or Cart Checkout
            $table->boolean('is_buy_now')->default(false);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_pembelis');
    }
};