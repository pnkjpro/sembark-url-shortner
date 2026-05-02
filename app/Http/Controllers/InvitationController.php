<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Invitation;
use App\Models\User;
use App\Traits\JsonResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Enum;

class InvitationController extends Controller
{
    use JsonResponseTrait;

    public function store(Request $request)
    {
        $this->authorize('create', Invitation::class);

        $user = $request->user();

        if ($user->role === UserRole::SUPER_ADMIN) {
            return $this->storeAsSuperAdmin($request);
        }

        return $this->storeAsAdmin($request, $user);
    }

    private function storeAsSuperAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'company_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse([], $validator->errors()->first(), 422);
        }

        try {
            DB::beginTransaction();

            $company = Company::create(['name' => $request->company_name]);

            $invitation = Invitation::create([
                'email' => $request->email,
                'role' => UserRole::ADMIN->value,
                'token' => Str::random(64),
                'company_id' => $company->id,
                'invited_by' => $request->user()->id,
                'expires_at' => now()->addHours(48),
            ]);

            DB::commit();

            return $this->successResponse([
                'invitation' => $invitation,
                'company' => $company,
            ], 'Invitation sent successfully.', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse(null, $e->getMessage(), 500);
        }
    }

    private function storeAsAdmin(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'role' => ['required', new Enum(UserRole::class)],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse([], $validator->errors()->first(), 422);
        }

        $role = UserRole::from($request->role);

        if (!in_array($role, [UserRole::ADMIN, UserRole::MEMBER])) {
            return $this->errorResponse(null, 'You can only invite Admin or Member roles.', 422);
        }

        $invitation = Invitation::create([
            'email' => $request->email,
            'role' => $role->value,
            'token' => Str::random(64),
            'company_id' => $user->company_id,
            'invited_by' => $user->id,
            'expires_at' => now()->addHours(48),
        ]);

        return $this->successResponse($invitation, 'Invitation sent successfully.', 201);
    }

    public function accept(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse([], $validator->errors()->first(), 422);
        }

        $invitation = Invitation::where('token', $request->token)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$invitation) {
            return $this->errorResponse(null, 'Invalid or expired invitation.', 422);
        }

        if (User::where('email', $invitation->email)->exists()) {
            return $this->errorResponse(null, 'A user with this email already exists.', 422);
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $invitation->email,
                'password' => Hash::make($request->password),
                'role' => $invitation->role,
                'company_id' => $invitation->company_id,
            ]);

            $invitation->update(['accepted_at' => now()]);

            $token = $user->createToken('auth-token')->plainTextToken;
            DB::commit();

            return $this->successResponse([
                'user' => $user,
                'token' => $token,
            ], 'Account created successfully.', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse(null, $e->getMessage(), 500);
        }
    }
}
