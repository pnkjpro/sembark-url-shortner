<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;

class RedirectController extends Controller
{
    public function __invoke(string $shortCode)
    {
        $shortUrl = ShortUrl::where('short_code', $shortCode)->firstOrFail();

        return redirect()->away($shortUrl->original_url);
    }
}
