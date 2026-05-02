<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\ShortUrl;
use App\Traits\JsonResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ShortUrlController extends Controller
{
    use JsonResponseTrait;

    public function index(Request $request)
    {
        $this->authorize('view', ShortUrl::class);

        $user = $request->user();
        $query = ShortUrl::query();

        match ($user->role) {
            UserRole::SUPER_ADMIN => $query->with('company', 'creator'),
            UserRole::ADMIN => $query->where('company_id', $user->company_id)->with('creator'),
            UserRole::MEMBER => $query->where('created_by', $user->id),
        };

        return $this->successResponse($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $this->authorize('create', ShortUrl::class);

        $validator = Validator::make($request->all(), [
            'original_url' => 'required|url',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse([], $validator->errors()->first(), 422);
        }

        $user = $request->user();

        do {
            $code = Str::random(8);
        } while (ShortUrl::where('short_code', $code)->exists());

        $shortUrl = ShortUrl::create([
            'original_url' => $request->original_url,
            'short_code' => $code,
            'company_id' => $user->company_id,
            'created_by' => $user->id,
        ]);

        return $this->successResponse($shortUrl, 'Short URL created successfully.', 201);
    }
}

