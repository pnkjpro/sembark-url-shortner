<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\ShortUrl;
use App\Models\User;

class ShortUrlPolicy
{
    public function view(User $user): bool
    {
        return in_array($user->role, [UserRole::SUPER_ADMIN, UserRole::ADMIN, UserRole::MEMBER]);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::ADMIN, UserRole::MEMBER]);
    }
}
