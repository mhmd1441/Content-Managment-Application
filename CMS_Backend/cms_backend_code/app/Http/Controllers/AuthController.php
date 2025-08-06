<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'first_name'     => 'required|string',
            'last_name'      => 'required|string',
            'job_title'      => 'required|string',
            'phone_number'   => 'required|string',
            'email'          => 'required|string|email|unique:users,email',
            'password'       => 'required|string|confirmed',
        ]);

        $user = User::create([
            'first_name'    => $fields['first_name'],
            'last_name'     => $fields['last_name'],
            'job_title'     => $fields['job_title'],
            'phone_number'  => $fields['phone_number'],
            'email'         => $fields['email'],
            'password'      => Hash::make($fields['password']),
        ]);

        return response([
            'user' => $user,
            'message' => 'Registered successfully',
        ], 201);
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($fields)) {
            return response([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();

        $token = $user->createToken('authToken')->plainTextToken;

        return response([
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('auth.login')->with([
            'message' => 'You have been logged out successfully.',
            'title' => 'Logout Successful !',
        ]);
    }
    // public function forgotPassword(Request $request): RedirectResponse
    // {
    //     $request->validate(['email' => 'required|email',]);
    //
    //     $status = Password::sendResetLink(
    //         $request->only('email')
    //     );
    //
    //     return $status === Password::RESET_LINK_SENT
    //         ? back()->with(['status' => __($status)])
    //         : back()->withErrors(['email' => __($status)]);
    // }
    // public function resetPassword(Request $request): RedirectResponse
    // {
    //     $request->validate([
    //         'token' => 'required',
    //         'email' => 'required|email',
    //         'password' => 'required|min:8|confirmed',
    //     ]);
    //
    //     $status = Password::reset(
    //         $request->only('email', 'password', 'password_confirmation', 'token'),
    //         function (User $user, string $password) {
    //             $user->forceFill([
    //                 'password' => Hash::make($password)
    //             ])->setRememberToken(Str::random(60));
    //             $user->save();
    //             event(new PasswordReset($user));
    //         }
    //     );
    //
    //     return $status === Password::PASSWORD_RESET
    //         ? redirect()->route('auth.login')->with('message', __($status))->with('title', 'Password Reset Successful !')
    //         : back()->withErrors(['email' => __($status)]);
    // }
    // public function verifyEmail(EmailVerificationRequest $request): RedirectResponse
    // {
    //     $request->fulfill();
    //     return redirect()->route('auth.login')->with([
    //         'message' => 'Your email has been successfully verified.',
    //         'title' => 'Email Verification Successful !',
    //     ]);
    // }
    // public function resendVerifyEmail(Request $request): RedirectResponse
    // {
    //     $request->user()->sendEmailVerificationNotification();
    //     return redirect()->route('auth.login')->with([
    //         'message' => 'Your email verification link has been resent. Please check your inbox.',
    //         'title' => 'Email Verification Link Sent !',
    //     ]);
    // }
}
