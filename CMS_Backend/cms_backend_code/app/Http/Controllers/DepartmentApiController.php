<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Department;
use App\Traits\API_response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class DepartmentApiController extends Controller
{
    use API_response;

    public function index()
    {
        $data = Department::all();
        return $this->sendResponse("List of all Departments", $data);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'country'      => 'required',
            'city'      => 'required',
            'director_id'   => 'required',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $userId = Auth::id();
        $obj = new Department([
            'name'     => $request->name,
            'country'      => $request->country,
            'city'      => $request->city,
            'director_id'   => $request->director_id,
            'created_by' => $userId,
            'updated_by'     => $userId,
        ]);

        $obj->save();

        return $this->sendResponse("Department created Successfully", $obj, Response::HTTP_CREATED);
    }

    public function show($id)
    {
        $obj = Department::find($id);
        if (!$obj) {
            return $this->sendError("Department Not Found", [], Response::HTTP_BAD_REQUEST);
        }
        return $this->sendResponse("Department information", $obj, Response::HTTP_OK);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'sometimes|required|string|max:255',
            'country'      => 'required',
            'city'      => 'required',
            'director_id' => 'sometimes|nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $obj = Department::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        if ($request->has('name')) {
            $obj->name = $request->name;
        }
        $obj->country      = $request->country;
        $obj->city      = $request->city;
        $obj->director_id   = $request->director_id;
        $obj->updated_by = Auth::id();
        $obj->created_by = Auth::id();
        $obj->save();

        return $this->sendResponse("Department updated Successfully", $obj);
    }

    public function destroy($id)
    {
        $obj = Department::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->delete();

        return $this->sendResponse("Department deleted Successfully", []);
    }
    public function totalDepartments()
    {
        return Department::all()->count();
    }

    public function newDepartmentsThisMonth()
    {
        $now = Carbon::now();

        $count = Department::whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();

        return response()->json(['count' => $count]);
    }
}
