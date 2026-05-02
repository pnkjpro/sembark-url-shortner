<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ShortUrlPolicy
{
    public function view(User $user): Response
    {
        return in_array($user->role, [UserRole::SUPER_ADMIN, UserRole::ADMIN, UserRole::MEMBER])
            ? Response::allow()
            : Response::deny('You do not have permission to view short URLs.');
    }

    public function create(User $user): Response
    {
        return in_array($user->role, [UserRole::ADMIN, UserRole::MEMBER])
            ? Response::allow()
            : Response::deny('Only Admin and Member can create short URLs.');
    }
}
