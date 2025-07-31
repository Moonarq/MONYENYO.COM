<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DataPembeliResource\Pages;
use App\Models\DataPembeli;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Illuminate\Database\Eloquent\Builder;
use Filament\Tables\Actions\Action;
use Filament\Notifications\Notification;

class DataPembeliResource extends Resource
{
    protected static ?string $model = DataPembeli::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationLabel = 'Pesanan Masuk';
    protected static ?string $modelLabel = 'Pesanan';
    protected static ?string $pluralModelLabel = 'Pesanan';
    protected static ?string $navigationGroup = 'Manajemen Pesanan';
    protected static ?int $navigationSort = 1;

    /**
     * Form hanya untuk update status dan catatan admin
     */
    public static function form(Form $form): Form
    {
        return $form->schema([
            // Status Management Section - Primary focus for admin
            Forms\Components\Section::make('Manajemen Status Pesanan')
                ->description('Update status pesanan dan kelola proses pengiriman')
                ->icon('heroicon-o-cog-6-tooth')
                ->schema([
                    Forms\Components\Grid::make(2)
                        ->schema([
                            Forms\Components\Select::make('status')
                                ->label('Status Pesanan')
                                ->options(self::getOrderStatuses())
                                ->required()
                                ->native(false)
                                ->live() // Real-time updates
                                ->afterStateUpdated(function ($state, $old, $livewire) {
                                    // Auto-notify status change
                                    if ($state !== $old && $old !== null) {
                                        Notification::make()
                                            ->title('Status berhasil diperbarui')
                                            ->success()
                                            ->send();
                                    }
                                }),
                            
                            Forms\Components\DateTimePicker::make('status_updated_at')
                                ->label('Waktu Update Status')
                                ->default(now())
                                ->disabled()
                                ->dehydrated(false),
                        ]),

                    Forms\Components\Textarea::make('admin_notes')
                        ->label('Catatan Admin')
                        ->placeholder('Tambahkan catatan internal untuk tim...')
                        ->rows(3)
                        ->columnSpanFull(),
                ])
                ->collapsible(),

            // Customer Information - Read Only Display
            Forms\Components\Section::make('Data Pembeli')
                ->description('Informasi otomatis dari sistem checkout')
                ->icon('heroicon-o-user-circle')
                ->schema([
                    Forms\Components\Grid::make(2)
                        ->schema([
                            Forms\Components\TextInput::make('name')
                                ->label('Nama Pembeli')
                                ->disabled()
                                ->dehydrated(false),
                            
                            Forms\Components\TextInput::make('phone')
                                ->label('Nomor Telepon')
                                ->disabled()
                                ->dehydrated(false)
                                ->suffixAction(
                                    Forms\Components\Actions\Action::make('whatsapp')
                                        ->icon('heroicon-o-chat-bubble-bottom-center-text')  
                                        ->url(fn ($record) => "https://wa.me/" . preg_replace('/[^0-9]/', '', $record?->phone))
                                        ->openUrlInNewTab()
                                        ->tooltip('Buka WhatsApp')
                                ),
                        ]),
                ])
                ->collapsible()
                ->collapsed(),

            // Shipping Address - Read Only
            Forms\Components\Section::make('Alamat Pengiriman')
                ->description('Alamat tujuan pengiriman dari customer')
                ->icon('heroicon-o-map-pin')
                ->schema([
                    Forms\Components\Textarea::make('full_address')
                        ->label('Alamat Lengkap')
                        ->disabled()
                        ->dehydrated(false)
                        ->rows(3),
                    
                    Forms\Components\Grid::make(4)
                        ->schema([
                            Forms\Components\TextInput::make('province')
                                ->label('Provinsi')
                                ->disabled()
                                ->dehydrated(false),
                            
                            Forms\Components\TextInput::make('regency')
                                ->label('Kab/Kota')
                                ->disabled()
                                ->dehydrated(false),
                            
                            Forms\Components\TextInput::make('district')
                                ->label('Kecamatan')
                                ->disabled()
                                ->dehydrated(false),
                            
                            Forms\Components\TextInput::make('zip_code')
                                ->label('Kode Pos')
                                ->disabled()
                                ->dehydrated(false),
                        ]),
                ])
                ->collapsible()
                ->collapsed(),

            // Order Details - Read Only
            Forms\Components\Section::make('Detail Pesanan')
                ->description('Informasi otomatis dari proses checkout')
                ->icon('heroicon-o-shopping-cart')
                ->schema([
                    Forms\Components\Grid::make(3)
                        ->schema([
                            Forms\Components\Select::make('payment_method')
                                ->label('Metode Pembayaran')
                                ->options(self::getPaymentMethods())
                                ->disabled()
                                ->dehydrated(false),
                            
                            Forms\Components\Select::make('shipping_method')
                                ->label('Metode Pengiriman')
                                ->options(self::getShippingMethods())
                                ->disabled()
                                ->dehydrated(false),
                            
                            Forms\Components\TextInput::make('total_items')
                                ->label('Jumlah Item')
                                ->disabled()
                                ->dehydrated(false)
                                ->suffix(' pcs'),
                        ]),
                    
                    Forms\Components\Grid::make(2)
                        ->schema([
                            Forms\Components\Toggle::make('use_insurance')
                                ->label('Menggunakan Asuransi')
                                ->disabled()
                                ->dehydrated(false),
                            
                            Forms\Components\Toggle::make('is_buy_now')
                                ->label('Pembelian Langsung')
                                ->disabled()
                                ->dehydrated(false),
                        ]),
                ])
                ->collapsible()
                ->collapsed(),

            // Price Summary - Read Only
            Forms\Components\Section::make('Ringkasan Pembayaran')
                ->description('Detail biaya dari sistem checkout')
                ->icon('heroicon-o-banknotes')
                ->schema([
                    Forms\Components\Grid::make(3)
                        ->schema([
                            Forms\Components\TextInput::make('subtotal_before_voucher')
                                ->label('Subtotal Produk')
                                ->disabled()
                                ->dehydrated(false)
                                ->prefix('Rp ')
                                ->formatStateUsing(fn ($state) => number_format($state ?? 0)),
                            
                            Forms\Components\TextInput::make('total_voucher_discount')
                                ->label('Diskon Voucher')
                                ->disabled()
                                ->dehydrated(false)
                                ->prefix('Rp ')
                                ->formatStateUsing(fn ($state) => number_format($state ?? 0)),
                            
                            Forms\Components\TextInput::make('shipping_cost')
                                ->label('Biaya Pengiriman')
                                ->disabled()
                                ->dehydrated(false)
                                ->prefix('Rp ')
                                ->formatStateUsing(fn ($state) => number_format($state ?? 0)),
                        ]),
                    
                    Forms\Components\TextInput::make('grand_total')
                        ->label('Total Pembayaran')
                        ->disabled()
                        ->dehydrated(false)
                        ->prefix('Rp ')
                        ->formatStateUsing(fn ($state) => number_format($state ?? 0))
                        ->extraAttributes(['class' => 'font-bold text-lg'])
                        ->columnSpanFull(),
                ])
                ->collapsible()
                ->collapsed(),

            // Customer Notes - Read Only
            Forms\Components\Section::make('Catatan Pembeli')
                ->description('Catatan khusus dari customer')
                ->icon('heroicon-o-chat-bubble-left-ellipsis')
                ->schema([
                    Forms\Components\Textarea::make('notes')
                        ->label('Pesan dari Pembeli')
                        ->disabled()
                        ->dehydrated(false)
                        ->placeholder('Tidak ada catatan khusus')
                        ->rows(2),
                ])
                ->collapsible()
                ->collapsed(),
        ]);
    }

    /**
     * Table untuk monitoring pesanan masuk
     */
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // Order ID atau timestamp
                Tables\Columns\TextColumn::make('id')
                    ->label('ID Pesanan')
                    ->searchable()
                    ->sortable()
                    ->prefix('#')
                    ->weight('bold')
                    ->size('sm'),

                // Customer info
                Tables\Columns\TextColumn::make('name')
                    ->label('Pembeli')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-o-user')
                    ->description(fn ($record) => $record->phone)
                    ->wrap(),

                // Status dengan priority visual
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Status')
                    ->colors([
                        'danger' => 'pending',
                        'warning' => 'paid', 
                        'info' => 'processing',
                        'primary' => 'shipped',
                        'success' => 'delivered',
                        'gray' => 'cancelled',
                    ])
                    ->icons([
                        'heroicon-o-clock' => 'pending',
                        'heroicon-o-credit-card' => 'paid',
                        'heroicon-o-cog-6-tooth' => 'processing',
                        'heroicon-o-truck' => 'shipped',
                        'heroicon-o-check-circle' => 'delivered',
                        'heroicon-o-x-circle' => 'cancelled',
                    ])
                    ->formatStateUsing(fn (string $state): string => 
                        self::getOrderStatuses()[$state] ?? $state
                    ),

                // Payment method
                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Pembayaran')
                    ->formatStateUsing(fn (string $state): string => 
                        self::getPaymentMethods()[$state] ?? $state
                    )
                    ->badge()
                    ->color('gray')
                    ->size('sm'),

                // Grand total with prominence
                Tables\Columns\TextColumn::make('grand_total')
                    ->label('Total')
                    ->money('IDR')
                    ->sortable()
                    ->weight('bold')
                    ->alignEnd()
                    ->color('success')
                    ->size('sm'),

                // Order type
                Tables\Columns\IconColumn::make('is_buy_now')
                    ->label('Tipe')
                    ->boolean()
                    ->trueIcon('heroicon-o-bolt')
                    ->falseIcon('heroicon-o-shopping-cart')
                    ->trueColor('warning')
                    ->falseColor('info')
                    ->tooltip(fn ($record) => $record->is_buy_now ? 'Buy Now' : 'Keranjang'),

                // Location info
                Tables\Columns\TextColumn::make('regency')
                    ->label('Kota Tujuan')
                    ->icon('heroicon-o-map-pin')
                    ->searchable()
                    ->toggleable()
                    ->size('sm'),

                // Time info
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Waktu Pesan')
                    ->dateTime('d/m H:i')
                    ->sortable()
                    ->since()
                    ->tooltip(fn ($record) => $record->created_at->format('l, d F Y H:i:s'))
                    ->size('sm'),
            ])
            ->filters([
                // Status filter dengan counter
                Tables\Filters\SelectFilter::make('status')
                    ->label('Status')
                    ->options(self::getOrderStatuses())
                    ->multiple()
                    ->preload(),

                // Payment method filter
                Tables\Filters\SelectFilter::make('payment_method')
                    ->label('Metode Pembayaran')
                    ->options(self::getPaymentMethods())
                    ->multiple(),

                // Today's orders
                Tables\Filters\Filter::make('today')
                    ->label('Pesanan Hari Ini')
                    ->query(fn (Builder $query): Builder => $query->whereDate('created_at', today()))
                    ->toggle(),

                // This week orders
                Tables\Filters\Filter::make('this_week')
                    ->label('Minggu Ini')
                    ->query(fn (Builder $query): Builder => $query->whereBetween('created_at', [
                        now()->startOfWeek(),
                        now()->endOfWeek()
                    ]))
                    ->toggle(),

                // High value orders
                Tables\Filters\Filter::make('high_value')
                    ->label('Pesanan > 500K')
                    ->query(fn (Builder $query): Builder => $query->where('grand_total', '>', 500000))
                    ->toggle(),

                // Buy now orders
                Tables\Filters\TernaryFilter::make('is_buy_now')
                    ->label('Tipe Pembelian')
                    ->trueLabel('Buy Now')
                    ->falseLabel('Keranjang')
                    ->native(false),
            ])
            ->headerActions([
                // Quick stats or export actions could go here
            ])
            ->actions([
                // Quick status update actions
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\Action::make('mark_paid')
                        ->label('Tandai Dibayar')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->visible(fn ($record) => $record->status === 'pending')
                        ->requiresConfirmation()
                        ->action(function ($record) {
                            $record->update(['status' => 'paid']);
                            Notification::make()
                                ->title('Status berhasil diupdate ke "Dibayar"')
                                ->success()
                                ->send();
                        }),
                    
                    Tables\Actions\Action::make('mark_processing')
                        ->label('Mulai Proses')
                        ->icon('heroicon-o-cog-6-tooth')
                        ->color('info')
                        ->visible(fn ($record) => $record->status === 'paid')
                        ->requiresConfirmation()
                        ->action(function ($record) {
                            $record->update(['status' => 'processing']);
                            Notification::make()
                                ->title('Pesanan mulai diproses')
                                ->success()
                                ->send();
                        }),
                    
                    Tables\Actions\Action::make('mark_shipped')
                        ->label('Kirim')
                        ->icon('heroicon-o-truck')
                        ->color('primary')
                        ->visible(fn ($record) => $record->status === 'processing')
                        ->requiresConfirmation()
                        ->action(function ($record) {
                            $record->update(['status' => 'shipped']);
                            Notification::make()
                                ->title('Pesanan dikirim')
                                ->success()
                                ->send();
                        }),
                ])
                ->label('Quick Actions')
                ->icon('heroicon-o-bolt')
                ->size('sm')
                ->color('gray'),

                Tables\Actions\EditAction::make()
                    ->label('Kelola')
                    ->size('sm'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    // Bulk status updates
                    Tables\Actions\BulkAction::make('bulk_paid')
                        ->label('Tandai Dibayar')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records) {
                            $records->each->update(['status' => 'paid']);
                            Notification::make()
                                ->title(count($records) . ' pesanan ditandai sebagai dibayar')
                                ->success()
                                ->send();
                        }),
                    
                    Tables\Actions\BulkAction::make('bulk_processing')
                        ->label('Mulai Proses')
                        ->icon('heroicon-o-cog-6-tooth')
                        ->color('info')
                        ->requiresConfirmation()
                        ->action(function ($records) {
                            $records->each->update(['status' => 'processing']);
                            Notification::make()
                                ->title(count($records) . ' pesanan mulai diproses')
                                ->success()
                                ->send();
                        }),
                    
                    Tables\Actions\DeleteBulkAction::make()
                        ->requiresConfirmation(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->paginated([25, 50, 100])
            ->poll('30s') // Auto refresh every 30 seconds
            ->persistFiltersInSession()
            ->persistSortInSession();
    }

    /**
     * Detailed view untuk monitoring pesanan
     */
    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            // Order Header dengan status prominent
            Infolists\Components\Section::make('Status Pesanan')
                ->icon('heroicon-o-clipboard-document-check')
                ->schema([
                    Infolists\Components\Grid::make(3)
                        ->schema([
                            Infolists\Components\TextEntry::make('id')
                                ->label('ID Pesanan')
                                ->prefix('#')
                                ->size('lg')
                                ->weight('bold'),
                            
                            Infolists\Components\TextEntry::make('status')
                                ->label('Status Saat Ini')
                                ->badge()
                                ->size('lg')
                                ->color(fn (string $state): string => match ($state) {
                                    'pending' => 'danger',
                                    'paid' => 'warning',
                                    'processing' => 'info',
                                    'shipped' => 'primary',
                                    'delivered' => 'success',
                                    'cancelled' => 'gray',
                                    default => 'gray',
                                })
                                ->formatStateUsing(fn (string $state): string => 
                                    self::getOrderStatuses()[$state] ?? $state
                                ),
                            
                            Infolists\Components\TextEntry::make('created_at')
                                ->label('Waktu Pesan')
                                ->dateTime('d F Y, H:i')
                                ->since(),
                        ]),
                ]),

            // Customer Information
            Infolists\Components\Section::make('Informasi Pembeli')
                ->icon('heroicon-o-user-circle')
                ->schema([
                    Infolists\Components\Grid::make(2)
                        ->schema([
                            Infolists\Components\TextEntry::make('name')
                                ->label('Nama Pembeli')
                                ->icon('heroicon-o-user')
                                ->size('lg')
                                ->weight('medium')
                                ->copyable(),
                            
                            Infolists\Components\TextEntry::make('phone')
                                ->label('Nomor Telepon')
                                ->icon('heroicon-o-phone')
                                ->copyable()
                                ->url(fn ($record) => "https://wa.me/" . preg_replace('/[^0-9]/', '', $record->phone))
                                ->openUrlInNewTab()
                                ->color('success'),
                        ]),
                    
                    Infolists\Components\TextEntry::make('full_address')
                        ->label('Alamat Pengiriman Lengkap')
                        ->icon('heroicon-o-map-pin')
                        ->columnSpanFull()
                        ->copyable(),
                ]),

            // Payment & Shipping Details
            Infolists\Components\Section::make('Detail Pembayaran & Pengiriman')
                ->icon('heroicon-o-credit-card')
                ->schema([
                    Infolists\Components\Grid::make(2)
                        ->schema([
                            Infolists\Components\TextEntry::make('payment_method')
                                ->label('Metode Pembayaran')
                                ->formatStateUsing(fn (string $state): string => 
                                    self::getPaymentMethods()[$state] ?? $state
                                )
                                ->badge()
                                ->color('info')
                                ->icon('heroicon-o-credit-card'),
                            
                            Infolists\Components\TextEntry::make('shipping_method')
                                ->label('Metode Pengiriman')
                                ->formatStateUsing(fn (string $state): string => 
                                    self::getShippingMethods()[$state] ?? $state
                                )
                                ->badge()
                                ->color('primary')
                                ->icon('heroicon-o-truck'),
                        ]),
                    
                    Infolists\Components\Grid::make(2)
                        ->schema([
                            Infolists\Components\IconEntry::make('use_insurance')
                                ->label('Asuransi Pengiriman')
                                ->boolean()
                                ->trueIcon('heroicon-o-shield-check')
                                ->falseIcon('heroicon-o-shield-exclamation'),
                            
                            Infolists\Components\IconEntry::make('is_buy_now')
                                ->label('Tipe Pembelian')
                                ->boolean()
                                ->trueIcon('heroicon-o-bolt')
                                ->falseIcon('heroicon-o-shopping-cart')
                                ->trueColor('warning')
                                ->falseColor('info'),
                        ]),
                ]),

            // Items Detail
            Infolists\Components\Section::make('Detail Produk')
                ->icon('heroicon-o-cube')
                ->schema([
                    Infolists\Components\RepeatableEntry::make('items')
                        ->label('')
                        ->schema([
                            Infolists\Components\Grid::make(5)
                                ->schema([
                                    Infolists\Components\TextEntry::make('name')
                                        ->label('Nama Produk')
                                        ->weight('medium')
                                        ->columnSpan(2),
                                    
                                    Infolists\Components\TextEntry::make('sku')
                                        ->label('SKU')
                                        ->placeholder('N/A')
                                        ->color('gray')
                                        ->size('sm'),
                                    
                                    Infolists\Components\TextEntry::make('quantity')
                                        ->label('Qty')
                                        ->suffix(' pcs')
                                        ->weight('medium')
                                        ->alignCenter(),
                                    
                                    Infolists\Components\TextEntry::make('price')
                                        ->label('Harga')
                                        ->money('IDR')
                                        ->weight('medium')
                                        ->alignEnd(),
                                ]),
                        ])
                        ->contained(false),
                ]),

            // Financial Summary
            Infolists\Components\Section::make('Ringkasan Keuangan')
                ->icon('heroicon-o-banknotes')
                ->schema([
                    Infolists\Components\Grid::make(2)
                        ->schema([
                            Infolists\Components\TextEntry::make('subtotal_before_voucher')
                                ->label('Subtotal Produk')
                                ->money('IDR')
                                ->size('lg'),
                            
                            Infolists\Components\TextEntry::make('total_voucher_discount')
                                ->label('Diskon Voucher')
                                ->money('IDR')
                                ->color('success')
                                ->prefix('- ')
                                ->visible(fn ($record) => $record->total_voucher_discount > 0),
                            
                            Infolists\Components\TextEntry::make('shipping_cost')
                                ->label('Biaya Pengiriman')
                                ->money('IDR'),
                            
                            Infolists\Components\TextEntry::make('insurance_cost')
                                ->label('Biaya Asuransi')
                                ->money('IDR')
                                ->visible(fn ($record) => $record->use_insurance),
                        ]),
                    
                    Infolists\Components\Separator::make(),
                    
                    Infolists\Components\TextEntry::make('grand_total')
                        ->label('TOTAL PEMBAYARAN')
                        ->money('IDR')
                        ->size(Infolists\Components\TextEntry\TextEntrySize::Large)
                        ->weight('bold')
                        ->color('primary')
                        ->columnSpanFull(),
                ]),

            // Notes & Timeline
            Infolists\Components\Section::make('Catatan & Riwayat')
                ->icon('heroicon-o-document-text')
                ->schema([
                    Infolists\Components\TextEntry::make('notes')
                        ->label('Catatan dari Pembeli')
                        ->placeholder('Tidak ada catatan khusus')
                        ->columnSpanFull()
                        ->color('gray'),
                    
                    Infolists\Components\TextEntry::make('admin_notes')
                        ->label('Catatan Admin Internal')
                        ->placeholder('Belum ada catatan admin')
                        ->columnSpanFull()
                        ->color('info'),
                    
                    Infolists\Components\Grid::make(2)
                        ->schema([
                            Infolists\Components\TextEntry::make('created_at')
                                ->label('Waktu Pesanan Masuk')
                                ->dateTime('l, d F Y H:i:s'),
                            
                            Infolists\Components\TextEntry::make('updated_at')
                                ->label('Terakhir Diupdate')
                                ->dateTime('l, d F Y H:i:s')
                                ->since(),
                        ]),
                ])
                ->collapsible()
                ->collapsed(),
        ]);
    }

    /**
     * Payment methods yang tersedia
     */
    protected static function getPaymentMethods(): array
    {
        return [
            'bca' => 'BCA Virtual Account',
            'mandiri' => 'Mandiri Virtual Account', 
            'bri' => 'BRI Virtual Account',
            'bni' => 'BNI Virtual Account',
            'alfamart' => 'Alfamart/Alfamidi',
            'indomaret' => 'Indomaret',
            'gopay' => 'GoPay',
            'ovo' => 'OVO',
            'dana' => 'DANA',
            'shopeepay' => 'ShopeePay',
            'linkaja' => 'LinkAja',
        ];
    }

    /**
     * Shipping methods yang tersedia
     */
    protected static function getShippingMethods(): array
    {
        return [
            'reguler' => 'Pengiriman Reguler (Gratis)',
            'ninja' => 'Ninja Xpress',
            'jne' => 'JNE',
            'pos' => 'Pos Indonesia', 
            'tiki' => 'TIKI',
            'sicepat' => 'SiCepat',
            'jnt' => 'J&T Express',
            'anteraja' => 'AnterAja',
            'gosend' => 'GoSend',
            'grab' => 'GrabExpress',
        ];
    }

    /**
     * Status pesanan yang tersedia
     */
    protected static function getOrderStatuses(): array
    {
        return [
            'pending' => 'Menunggu Pembayaran',
            'paid' => 'Sudah Dibayar',
            'processing' => 'Sedang Diproses',
            'shipped' => 'Dalam Pengiriman',
            'delivered' => 'Sudah Diterima',
            'cancelled' => 'Dibatalkan',
        ];
    }

    public static function getRelations(): array
    {
        return [
            // Relations untuk items, payments, shipments dll
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDataPembelis::route('/'),
            'edit' => Pages\EditDataPembeli::route('/{record}/edit'),
            // Tidak ada create & view page karena data otomatis dari sistem
        ];
    }

    /**
     * Global search untuk quick find
     */
    public static function getGlobalSearchAttributes(): array
    {
        return ['name', 'phone', 'id'];
    }

    public static function getGlobalSearchResultTitle($record): string
    {
        return "Pesanan #{$record->id} - {$record->name}";
    }

    public static function getGlobalSearchResultDetails($record): array
    {
        return [
            'Status' => self::getOrderStatuses()[$record->status] ?? $record->status,
            'Total' => 'Rp ' . number_format($record->grand_total),
            'Tanggal' => $record->created_at->format('d M Y'),
        ];
    }
}