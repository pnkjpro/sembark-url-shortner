<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class InvitationPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::SUPER_ADMIN, UserRole::ADMIN]);
    }
}
