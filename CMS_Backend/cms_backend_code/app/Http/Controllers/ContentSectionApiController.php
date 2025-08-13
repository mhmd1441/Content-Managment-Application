<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\contentSection;
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
        $data = contentSection::all();
        return $this->sendResponse("List of all contentSection", $data);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subtitle'      => 'required|string|max:255',
            'description'   => 'required',
            'image_path'    => 'required',
            'order'         => 'required|integer',
            'expand_mode'   => 'required|in:expanded,collapsed,free',
            'status'        => 'required|in:draft,published,archived',
            'published_at'  => 'required|date',
            'parent_id'     => 'nullable|exists:contentSection,id',
            'menu_id'       => 'required|exists:menus,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $userId = Auth::id();

        $obj = new contentSection([
            'subtitle'      => $request->subtitle,
            'description'   => $request->description,
            'image_path'    => $request->image_path,
            'order'         => $request->order,
            'expand_mode'   => $request->expand_mode,
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
        $obj = contentSection::find($id);
        if (!$obj) {
            return $this->sendError("contentSection Not Found", [], Response::HTTP_BAD_REQUEST);
        }
        return $this->sendResponse("contentSection information", $obj, Response::HTTP_OK);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'subtitle'      => 'sometimes|required|string|max:255',
            'description'   => 'sometimes|required',
            'image_path'    => 'sometimes|required',
            'order'         => 'sometimes|required|integer',
            'expand_mode'   => 'required|in:expanded,collapsed,free',
            'status'        => 'sometimes|required|in:draft,published,archived',
            'published_at'  => 'sometimes|required|date',
            'parent_id'     => 'nullable|exists:contentSection,id',
            'menu_id'       => 'sometimes|required|exists:menus,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $obj = contentSection::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->fill($request->only([
            'subtitle',
            'description',
            'image_path',
            'order',
            'expand_mode',
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
        $obj = contentSection::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->delete();

        return $this->sendResponse("contentSection deleted Successfully", []);
    }
}
