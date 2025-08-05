<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Traits\API_response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserApiController extends Controller
{
    use API_response;

    public function index()
    {
        $data = User::all();
        return $this->sendResponse("List of all users", $data);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required',
            'job_title'      => 'required',
            'phone_number'   => 'required',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required',
            'status'         => 'required',
            'role'           => 'required',
            'supervisor_id'  => 'required',
            'department_id'  => 'required',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $userId = Auth::id();

        $obj = new User([
            'first_name'     => $request->first_name,
            'last_name'      => $request->last_name,
            'job_title'      => $request->job_title,
            'phone_number'   => $request->phone_number,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'status'         => $request->status,
            'role'           => $request->role,
            'supervisor_id'  => $request->supervisor_id,
            'department_id'  => $request->department_id,
            'created_by'     => $userId,
            'updated_by'     => $userId,
        ]);

        $obj->save();

        return $this->sendResponse("User created Successfully", $obj, Response::HTTP_CREATED);
    }

    public function show($id)
    {
        $obj = User::find($id);
        if (!$obj) {
            return $this->sendError("User Not Found", [], Response::HTTP_BAD_REQUEST);
        }
        return $this->sendResponse("User information", $obj, Response::HTTP_OK);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'first_name'     => 'sometimes|required|string|max:255',
            'last_name'      => 'required',
            'job_title'      => 'required',
            'phone_number'   => 'required',
            'email'          => 'sometimes|email|unique:users,email,' . $id,
            'password'       => 'sometimes|nullable|min:6',
            'status'         => 'required',
            'role'           => 'required',
            'supervisor_id'  => 'required',
            'department_id'  => 'required',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $obj = User::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->first_name     = $request->first_name;
        $obj->last_name      = $request->last_name;
        $obj->job_title      = $request->job_title;
        $obj->phone_number   = $request->phone_number;

        if ($request->has('email')) {
            $obj->email = $request->email;
        }

        if ($request->filled('password')) {
            $obj->password = Hash::make($request->password);
        }

        $obj->status         = $request->status;
        $obj->role           = $request->role;
        $obj->supervisor_id  = $request->supervisor_id;
        $obj->department_id  = $request->department_id;
        $obj->updated_by     = Auth::id();

        $obj->save();

        return $this->sendResponse("User updated Successfully", $obj);
    }

    public function destroy($id)
    {
        $obj = User::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->delete();

        return $this->sendResponse("User deleted Successfully", []);
    }
}
