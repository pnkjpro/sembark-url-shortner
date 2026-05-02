<?php

use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
});

Route::get('/{shortCode}', RedirectController::class)
    ->where('shortCode', '[A-Za-z0-9]{8}');
