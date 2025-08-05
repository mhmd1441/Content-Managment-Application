<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\content_sections;
use App\Traits\API_response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ContentSectionApiController extends Controller
{
    use API_response;

    public function index()
    {
        $data = content_sections::all();
        return $this->sendResponse("List of all content_sections", $data);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subtitle'      => 'required|string|max:255',
            'description'   => 'required',
            'image_path'    => 'required',
            'order'         => 'required|integer',
            'is_expanded'   => 'required|boolean',
            'status'        => 'required|in:draft,published,archived',
            'published_at'  => 'required|date',
            'parent_id'     => 'nullable|exists:content_sections,id',
            'menu_id'       => 'required|exists:menus,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $userId = Auth::id();

        $obj = new content_sections([
            'subtitle'      => $request->subtitle,
            'description'   => $request->description,
            'image_path'    => $request->image_path,
            'order'         => $request->order,
            'is_expanded'   => $request->is_expanded,
            'status'        => $request->status,
            'published_at'  => $request->published_at,
            'parent_id'     => $request->parent_id,
            'menu_id'       => $request->menu_id,
            'created_by'    => $userId,
            'updated_by'    => $userId,
        ]);

        $obj->save();

        return $this->sendResponse("Content section created successfully", $obj, Response::HTTP_CREATED);
    }

    public function show($id)
    {
        $obj = content_sections::find($id);
        if (!$obj) {
            return $this->sendError("content_sections Not Found", [], Response::HTTP_BAD_REQUEST);
        }
        return $this->sendResponse("content_sections information", $obj, Response::HTTP_OK);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'subtitle'      => 'sometimes|required|string|max:255',
            'description'   => 'sometimes|required',
            'image_path'    => 'sometimes|required',
            'order'         => 'sometimes|required|integer',
            'is_expanded'   => 'sometimes|required|boolean',
            'status'        => 'sometimes|required|in:draft,published,archived',
            'published_at'  => 'sometimes|required|date',
            'parent_id'     => 'nullable|exists:content_sections,id',
            'menu_id'       => 'sometimes|required|exists:menus,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $obj = content_sections::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->fill($request->only([
            'subtitle',
            'description',
            'image_path',
            'order',
            'is_expanded',
            'status',
            'published_at',
            'parent_id',
            'menu_id'
        ]));

        $obj->updated_by = Auth::id();
        $obj->save();

        return $this->sendResponse("Content section updated successfully", $obj);
    }

    public function destroy($id)
    {
        $obj = content_sections::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->delete();

        return $this->sendResponse("content_sections deleted Successfully", []);
    }
}
