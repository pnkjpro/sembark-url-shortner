<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $now = now()->toDateTimeString();

        DB::statement("
            INSERT INTO users (name, email, password, role, company_id, created_at, updated_at)
            VALUES (
                'Super Admin',
                'superadmin@sembark.com',
                '" . bcrypt('password') . "',
                'super_admin',
                NULL,
                '{$now}',
                '{$now}'
            )
        ");
    }
}
