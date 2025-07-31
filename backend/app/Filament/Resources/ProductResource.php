<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Support\Enums\FontWeight;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-cube';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // Product Information Section
                Forms\Components\Section::make('Product Information')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                // SKU Field - readonly and auto-generated
                                Forms\Components\TextInput::make('sku')
                                    ->label('SKU')
                                    ->disabled()
                                    ->dehydrated(false)
                                    ->default(function ($record) {
                                        if ($record) {
                                            return $record->sku;
                                        }
                                        $lastId = Product::max('id') ?? 0;
                                        $nextId = $lastId + 1;
                                        return str_pad($nextId, 4, '0', STR_PAD_LEFT);
                                    })
                                    ->helperText('SKU akan dibuat otomatis berdasarkan ID produk')
                                    ->prefixIcon('heroicon-m-hashtag'),
                                    
                                // ID Field - readonly for displaying ID
                                Forms\Components\TextInput::make('id')
                                    ->label('ID')
                                    ->disabled()
                                    ->dehydrated(false)
                                    ->default(function ($record) {
                                        if ($record) {
                                            return $record->id;
                                        }
                                        $lastId = Product::max('id') ?? 0;
                                        return $lastId + 1;
                                    })
                                    ->prefixIcon('heroicon-m-identification'),
                                    
                                // Product Name
                                Forms\Components\TextInput::make('name')
                                    ->label('Product Name')
                                    ->required()
                                    ->maxLength(255)
                                    ->prefixIcon('heroicon-m-cube'),

                                // Category
                                Forms\Components\TextInput::make('category')
                                    ->label('Category')
                                    ->maxLength(255)
                                    ->prefixIcon('heroicon-m-tag'),
                            ]),
                            
                        // Description
                        Forms\Components\Textarea::make('description')
                            ->label('Product Description')
                            ->required()
                            ->rows(4)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
                    
                // Media Section
                Forms\Components\Section::make('Product Images')
                    ->schema([
                        Forms\Components\FileUpload::make('images')
                            ->label('Product Images')
                            ->image()
                            ->multiple()
                            ->maxFiles(5)
                            ->directory('images')
                            ->disk('public')
                            ->visibility('public')
                            ->required()
                            ->reorderable()
                            ->helperText('Upload up to 5 product images')
                            ->columnSpanFull(),
                    ]),
                    
                // Pricing Section
                Forms\Components\Section::make('Pricing Information')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                // Base Price
                                Forms\Components\TextInput::make('price')
                                    ->label('Base Price')
                                    ->required()
                                    ->numeric()
                                    ->prefix('Rp')
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($state, Forms\Set $set, Forms\Get $get) {
                                        $discount = $get('discount_percentage') ?? 0;
                                        $price = $state ?? 0;
                                        $discountedPrice = $price - ($price * $discount / 100);
                                        $set('discounted_price', $discountedPrice);
                                    })
                                    ->prefixIcon('heroicon-m-currency-dollar'),
                                    
                                // Discount Percentage
                                Forms\Components\TextInput::make('discount_percentage')
                                    ->label('Discount (%)')
                                    ->numeric()
                                    ->suffix('%')
                                    ->default(0)
                                    ->minValue(0)
                                    ->maxValue(100)
                                    ->step(0.01)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($state, Forms\Set $set, Forms\Get $get) {
                                        $price = $get('price') ?? 0;
                                        $discount = $state ?? 0;
                                        $discountedPrice = $price - ($price * $discount / 100);
                                        $set('discounted_price', $discountedPrice);
                                    })
                                    ->helperText('Masukkan persentase discount (0-100%)')
                                    ->prefixIcon('heroicon-m-receipt-percent'),
                            ]),
                            
                        // Discounted Price Display
                        Forms\Components\TextInput::make('discounted_price')
                            ->label('Harga Setelah Discount')
                            ->prefix('Rp')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($state) => $state ? number_format($state, 0, ',', '.') : '0')
                            ->helperText('Harga otomatis dihitung berdasarkan price dan discount')
                            ->prefixIcon('heroicon-m-calculator')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // SKU Column
                Tables\Columns\TextColumn::make('sku')
                    ->label('SKU')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->badge()
                    ->color('primary')
                    ->weight(FontWeight::Medium)
                    ->icon('heroicon-m-hashtag'),
                    
                // Product Name
                Tables\Columns\TextColumn::make('name')
                    ->label('Product Name')
                    ->searchable()
                    ->sortable()
                    ->limit(30)
                    ->weight(FontWeight::Medium)
                    ->wrap(),
                    
                // Product Image
                Tables\Columns\ImageColumn::make('first_image')
                    ->label('Image')
                    ->getStateUsing(function ($record) {
                        if (is_array($record->images) && count($record->images) > 0) {
                            $imagePath = $record->images[0];
                            
                            if (str_starts_with($imagePath, 'products/images/')) {
                                return $imagePath;
                            } elseif (str_starts_with($imagePath, 'images/')) {
                                return $imagePath;
                            } else {
                                return 'images/' . $imagePath;
                            }
                        }
                        return null;
                    })
                    ->disk('public')
                    ->size(60)
                    ->square()
                    ->defaultImageUrl('/images/placeholder.png'),
                    
                // Base Price
                Tables\Columns\TextColumn::make('price')
                    ->label('Harga')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->sortable()
                    ->weight(FontWeight::Medium)
                    ->color('gray'),
                    
                // Discount Percentage
                Tables\Columns\TextColumn::make('discount_percentage')
                    ->label('Discount')
                    ->formatStateUsing(fn ($state) => $state ? $state . '%' : '0%')
                    ->badge()
                    ->color(fn ($state) => $state > 0 ? 'success' : 'gray')
                    ->icon(fn ($state) => $state > 0 ? 'heroicon-m-tag' : null),
                    
                // Final Price (calculated)
                Tables\Columns\TextColumn::make('final_price')
                    ->label('Harga Final')
                    ->getStateUsing(function ($record) {
                        $price = $record->price ?? 0;
                        $discount = $record->discount_percentage ?? 0;
                        return $price - ($price * $discount / 100);
                    })
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->sortable(false)
                    ->weight(FontWeight::Bold)
                    ->color('success'),
                    
                // Category
                Tables\Columns\TextColumn::make('category')
                    ->label('Category')
                    ->searchable()
                    ->badge()
                    ->color('secondary')
                    ->formatStateUsing(fn ($state) => $state ? ucfirst($state) : 'Uncategorized'),
                    
                // Created At
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->color('gray'),
                    
                // Updated At
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->color('gray'),
            ])
            ->filters([
                // Category Filter
                Tables\Filters\SelectFilter::make('category')
                    ->label('Category')
                    ->options(
                        Product::distinct()
                            ->whereNotNull('category')
                            ->pluck('category', 'category')
                            ->toArray()
                    )
                    ->placeholder('All Categories')
                    ->multiple(),
                    
                // Discount Filter
                Tables\Filters\TernaryFilter::make('has_discount')
                    ->label('Ada Discount')
                    ->placeholder('All Products')
                    ->trueLabel('With Discount')
                    ->falseLabel('No Discount')
                    ->queries(
                        true: fn ($query) => $query->where('discount_percentage', '>', 0),
                        false: fn ($query) => $query->where('discount_percentage', '=', 0),
                    ),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->color('info'),
                    Tables\Actions\EditAction::make()
                        ->color('warning'),
                    Tables\Actions\DeleteAction::make()
                        ->requiresConfirmation(),
                ])
                ->icon('heroicon-m-ellipsis-vertical')
                ->size('sm')
                ->color('gray')
                ->button(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->requiresConfirmation(),
                ]),
            ])
            ->emptyStateHeading('No products found')
            ->emptyStateDescription('Create your first product to get started.')
            ->emptyStateIcon('heroicon-o-cube')
            ->defaultSort('created_at', 'desc')
            ->striped();
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}