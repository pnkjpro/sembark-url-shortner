<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InvitationPolicy
{
    public function create(User $user): Response
    {
        return in_array($user->role, [UserRole::SUPER_ADMIN, UserRole::ADMIN])
            ? Response::allow()
            : Response::deny('Only Super Admin and Admin can send invitations.');
    }
}
