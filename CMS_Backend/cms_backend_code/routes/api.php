<?php

use App\Http\Controllers\ActivityController;
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

        //Queries Related To User
        Route::get('/get_total_users', [UserApiController::class, 'total']);
        Route::get('/get_new_users', [UserApiController::class, 'newUsersThisMonth']);


        Route::get('/get_departments', [DepartmentApiController::class, 'index']);
        Route::post('/save_department', [DepartmentApiController::class, 'store']);
        Route::get('/show_department/{id}', [DepartmentApiController::class, 'show']);
        Route::put('/update_department/{id}', [DepartmentApiController::class, 'update']);
        Route::delete('/delete_department/{id}', [DepartmentApiController::class, 'destroy']);

        //Queries Related To Department
        Route::get('/get_total_departments', [DepartmentApiController::class, 'totalDepartments']);
        Route::get('/get_new_department', [DepartmentApiController::class, 'newDepartmentsThisMonth']);


        Route::get('/get_menus', [MenuApiController::class, 'index']);
        Route::post('/save_menu', [MenuApiController::class, 'store']);
        Route::get('/show_menu/{id}', [MenuApiController::class, 'show']);
        Route::put('/update_menu/{id}', [MenuApiController::class, 'update']);
        Route::delete('/delete_menu/{id}', [MenuApiController::class, 'destroy']);

        //Queries Related To Menu
        Route::get('/get_total_menus', [MenuApiController::class, 'totalMenus']);
        Route::get('/get_new_menus', [MenuApiController::class, 'newMenusThisMonth']);



        Route::get('/get_contentSections', [ContentSectionApiController::class, 'index']);
        Route::post('/save_contentSection', [ContentSectionApiController::class, 'store']);
        Route::get('/show_contentSection/{id}', [ContentSectionApiController::class, 'show']);
        Route::put('/update_contentSection/{id}', [ContentSectionApiController::class, 'update']);
        Route::delete('/delete_contentSection/{id}', [ContentSectionApiController::class, 'destroy']);

        //Queries Related To Menu
        Route::get('/get_total_contentSection', [ContentSectionApiController::class, 'totalContentSections']);
        Route::get('/get_new_contentSection', [ContentSectionApiController::class, 'newContentSectionThisMonth']);


        //Queries Related To Activity
        Route::post('/activity/session/start', [ActivityController::class, 'startSession']);
        Route::post('/activity/heartbeat',     [ActivityController::class, 'heartbeat']);
        Route::post('/activity/pageview/start',[ActivityController::class, 'startPageView']);
        Route::post('/activity/pageview/end',  [ActivityController::class, 'endPageView']);
        Route::post('/activity/session/end',   [ActivityController::class, 'endSession']);
        Route::get('/activity/analytics/sessions-by-role', [ActivityController::class, 'sessionsByRole']);
        Route::get('/activity/table', [ActivityController::class, 'sessionsTable']);

        Route::get('/metrics/dashboard-visits', [ActivityController::class, 'dashboardVisits']);
    });
});
