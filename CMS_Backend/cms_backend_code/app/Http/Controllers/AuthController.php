<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response(['message' => 'Logged out'], 200);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
