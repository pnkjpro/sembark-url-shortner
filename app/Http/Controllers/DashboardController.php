<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Invitation;
use App\Models\ShortUrl;
use App\Models\User;
use App\Traits\JsonResponseTrait;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use JsonResponseTrait;

    public function stats(Request $request)
    {
        $user = $request->user();

        $stats = match ($user->role) {
            UserRole::SUPER_ADMIN => [
                'total_urls' => ShortUrl::count(),
                'total_companies' => Company::count(),
                'total_users' => User::count(),
                'pending_invitations' => Invitation::whereNull('accepted_at')
                    ->where('expires_at', '>', now())
                    ->count(),
            ],
            UserRole::ADMIN => [
                'total_urls' => ShortUrl::where('company_id', $user->company_id)->count(),
                'total_users' => User::where('company_id', $user->company_id)->count(),
                'pending_invitations' => Invitation::where('company_id', $user->company_id)
                    ->whereNull('accepted_at')
                    ->where('expires_at', '>', now())
                    ->count(),
            ],
            UserRole::MEMBER => [
                'total_urls' => ShortUrl::where('created_by', $user->id)->count(),
            ],
        };

        return $this->successResponse($stats);
    }

    public function users(Request $request)
    {
        $user = $request->user();

        if ($user->role === UserRole::MEMBER) {
            return $this->errorResponse(null, 'You do not have permission to view users.', 403);
        }

        $query = User::query();

        match ($user->role) {
            UserRole::SUPER_ADMIN => $query->with('company'),
            UserRole::ADMIN => $query->where('company_id', $user->company_id),
            default => null,
        };

        return $this->successResponse($query->latest()->paginate(20));
    }
}
