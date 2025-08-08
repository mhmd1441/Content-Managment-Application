<?php

use App\Http\Controllers\ContentSectionApiController;
use App\Http\Controllers\DepartmentApiController;
use App\Http\Controllers\MenuApiController;
use App\Http\Controllers\UserApiController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;


Route::middleware([EnsureFrontendRequestsAreStateful::class])->group(function () {

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);

        Route::get('/get_users', [UserApiController::class, 'index']);
        Route::post('/save_user', [UserApiController::class, 'store']);
        Route::get('/show_user/{id}', [UserApiController::class, 'show']);
        Route::put('/update_user/{id}', [UserApiController::class, 'update']);
        Route::delete('/delete_user/{id}', [UserApiController::class, 'destroy']);

        Route::get('/get_departments', [DepartmentApiController::class, 'index']);
        Route::post('/save_department', [DepartmentApiController::class, 'store']);
        Route::get('/show_department/{id}', [DepartmentApiController::class, 'show']);
        Route::put('/update_department/{id}', [DepartmentApiController::class, 'update']);
        Route::delete('/delete_department/{id}', [DepartmentApiController::class, 'destroy']);

        Route::get('/get_menus', [MenuApiController::class, 'index']);
        Route::post('/save_menu', [MenuApiController::class, 'store']);
        Route::get('/show_menu/{id}', [MenuApiController::class, 'show']);
        Route::put('/update_menu/{id}', [MenuApiController::class, 'update']);
        Route::delete('/delete_menu/{id}', [MenuApiController::class, 'destroy']);

        Route::get('/get_contentSections', [ContentSectionApiController::class, 'index']);
        Route::post('/save_contentSection', [ContentSectionApiController::class, 'store']);
        Route::get('/show_contentSection/{id}', [ContentSectionApiController::class, 'show']);
        Route::put('/update_contentSection/{id}', [ContentSectionApiController::class, 'update']);
        Route::delete('/delete_contentSection/{id}', [ContentSectionApiController::class, 'destroy']);
    });
});
