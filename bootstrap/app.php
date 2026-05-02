<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $responder = new class { use \App\Traits\JsonResponseTrait; };

        $exceptions->renderable(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e) use ($responder) {
            return $responder->errorResponse(null, $e->getMessage() ?: 'Unauthorized action.', 403);
        });

        $exceptions->renderable(function (\Illuminate\Auth\Access\AuthorizationException $e) use ($responder) {
            return $responder->errorResponse(null, $e->getMessage() ?: 'Unauthorized action.', 403);
        });

        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e) use ($responder) {
            return $responder->errorResponse(null, 'Unauthenticated.', 401);
        });

        $exceptions->renderable(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e) use ($responder) {
            return $responder->errorResponse(null, 'Resource not found.', 404);
        });
    })->create();
