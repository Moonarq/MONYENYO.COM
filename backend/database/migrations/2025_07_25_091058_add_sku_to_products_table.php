<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->unique()->nullable()->after('id');
        });
        
        // Auto-generate SKU untuk data yang sudah ada
        DB::statement("UPDATE products SET sku = LPAD(id, 4, '0') WHERE sku IS NULL");
        
        // Setelah semua data terisi, ubah kolom menjadi not null
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->nullable(false)->change();
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('sku');
        });
    }
};