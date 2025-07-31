<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VoucherResource\Pages;
use App\Models\Voucher;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Support\Enums\FontWeight;

class VoucherResource extends Resource
{
    protected static ?string $model = Voucher::class;
    protected static ?string $navigationIcon = 'heroicon-o-ticket';
    protected static ?string $navigationGroup = 'Promosi';
    protected static ?string $label = 'Voucher';
    protected static ?string $pluralLabel = 'Vouchers';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informasi Voucher')
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->label('Nama Voucher')
                        ->required()
                        ->maxLength(100)
                        ->columnSpanFull(),

                    Forms\Components\Select::make('type')
                        ->label('Tipe Voucher')
                        ->options([
                            'free_shipping' => 'Gratis Ongkir',
                            'percent' => 'Diskon Persen (%)',
                            'fixed' => 'Potongan Tetap (Rp)',
                        ])
                        ->required()
                        ->native(false),

                    Forms\Components\TextInput::make('value')
                        ->label('Nilai Voucher')
                        ->numeric()
                        ->minValue(0)
                        ->nullable()
                        ->helperText('Kosongkan jika voucher berupa gratis ongkir.'),
                ])
                ->columns(2),

            Forms\Components\Section::make('Ketentuan Voucher')
                ->schema([
                    Forms\Components\TextInput::make('min_purchase')
                        ->label('Minimal Pembelian (Rp)')
                        ->numeric()
                        ->nullable()
                        ->prefix('Rp'),

                    Forms\Components\TextInput::make('max_uses')
                        ->label('Maksimal Penggunaan')
                        ->numeric()
                        ->nullable()
                        ->suffix('kali'),
                ])
                ->columns(2),

            Forms\Components\Section::make('Periode Voucher')
                ->schema([
                    Forms\Components\DatePicker::make('start_date')
                        ->label('Tanggal Mulai')
                        ->native(false),

                    Forms\Components\DatePicker::make('end_date')
                        ->label('Tanggal Berakhir')
                        ->native(false),

                    Forms\Components\Toggle::make('is_active')
                        ->label('Aktifkan Voucher')
                        ->default(true)
                        ->columnSpanFull(),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Voucher')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::SemiBold)
                    ->copyable()
                    ->tooltip('Klik untuk menyalin'),

                Tables\Columns\TextColumn::make('type')
                    ->label('Tipe')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'free_shipping' => 'success',
                        'percent' => 'warning', 
                        'fixed' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'free_shipping' => 'Gratis Ongkir',
                        'percent' => 'Diskon %',
                        'fixed' => 'Potongan Tetap',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('value')
                    ->label('Nilai')
                    ->sortable()
                    ->alignEnd()
                    ->weight(FontWeight::SemiBold)
                    ->formatStateUsing(function ($state, $record) {
                        if ($record->type === 'percent') {
                            return $state . '%';
                        } elseif ($record->type === 'fixed') {
                            return 'Rp ' . number_format($state, 0, ',', '.');
                        } else {
                            return '-';
                        }
                    })
                    ->color(fn ($record) => $record->type === 'free_shipping' ? 'success' : 'primary'),

                Tables\Columns\TextColumn::make('min_purchase')
                    ->label('Min. Pembelian')
                    ->sortable()
                    ->alignEnd()
                    ->formatStateUsing(function ($state) {
                        return $state ? 'Rp ' . number_format($state, 0, ',', '.') : '-';
                    })
                    ->placeholder('-')
                    ->color('gray'),

                Tables\Columns\TextColumn::make('usage_status')
                    ->label('Penggunaan')
                    ->state(function ($record) {
                        if (!$record->max_uses) return '-';
                        return ($record->used_count ?? 0) . ' / ' . $record->max_uses;
                    })
                    ->badge()
                    ->color(function ($record) {
                        if (!$record->max_uses) return 'gray';
                        $percentage = (($record->used_count ?? 0) / $record->max_uses) * 100;
                        if ($percentage >= 90) return 'danger';
                        if ($percentage >= 70) return 'warning';
                        return 'success';
                    }),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('period')
                    ->label('Periode')
                    ->state(function ($record) {
                        $start = $record->start_date ? $record->start_date->format('d/m/Y') : '-';
                        $end = $record->end_date ? $record->end_date->format('d/m/Y') : '-';
                        return $start . ' s/d ' . $end;
                    })
                    ->color('gray')
                    ->size(Tables\Columns\TextColumn\TextColumnSize::Small),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->color('gray')
                    ->size(Tables\Columns\TextColumn\TextColumnSize::Small),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Tipe Voucher')
                    ->options([
                        'free_shipping' => 'Gratis Ongkir',
                        'percent' => 'Diskon Persen',
                        'fixed' => 'Potongan Tetap',
                    ])
                    ->multiple(),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status Aktif')
                    ->trueLabel('Aktif')
                    ->falseLabel('Tidak Aktif')
                    ->native(false),

                Tables\Filters\Filter::make('active_period')
                    ->label('Periode Aktif')
                    ->query(fn (Builder $query): Builder => $query
                        ->where('start_date', '<=', now())
                        ->where(function ($query) {
                            $query->whereNull('end_date')
                                ->orWhere('end_date', '>=', now());
                        })
                    )
                    ->toggle(),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->modalHeading('Detail Voucher'),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\DeleteAction::make(),
                ])
                ->label('Aksi')
                ->icon('heroicon-m-ellipsis-vertical')
                ->size('sm')
                ->color('gray')
                ->button(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label('Aktifkan')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update(['is_active' => true]))
                        ->requiresConfirmation(),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('Nonaktifkan')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->requiresConfirmation(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->paginated([10, 25, 50])
            ->emptyStateHeading('Belum ada voucher')
            ->emptyStateDescription('Mulai dengan membuat voucher pertama Anda.')
            ->emptyStateIcon('heroicon-o-ticket');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVouchers::route('/'),
            'create' => Pages\CreateVoucher::route('/create'),
            'edit' => Pages\EditVoucher::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('is_active', true)->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'success';
    }
}