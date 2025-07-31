<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->string('name')->nullable();
          
            $table->enum('type', ['percent', 'fixed', 'free_shipping'])->nullable();
            $table->decimal('value', 10, 2)->nullable();
            $table->decimal('min_purchase', 10, 2)->nullable();
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
       
        });
    }

    public function down(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropColumn([
                'name',
               
                'type',
                'value',
                'min_purchase',
                'max_uses',
                'used_count',
                'start_date',
                'end_date',
                'is_active',
              
            ]);
        });
    }
};
