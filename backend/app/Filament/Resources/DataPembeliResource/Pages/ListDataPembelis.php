<?php

namespace App\Filament\Resources\DataPembeliResource\Pages;

use App\Filament\Resources\DataPembeliResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDataPembelis extends ListRecords
{
    protected static string $resource = DataPembeliResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
