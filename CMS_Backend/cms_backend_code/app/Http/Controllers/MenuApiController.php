<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;
use App\Traits\API_response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class MenuApiController extends Controller
{
    use API_response;

    public function index()
    {
        $data = Menu::all();
        return $this->sendResponse("List of all Menus", $data);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'        => 'required|string|max:255',
            'route'        => 'required|string|max:255',
            'order'        => 'required|integer',
            'status'       => 'required|in:draft,published,archived',
            'position'     => 'required|in:top,left',
            'published_at' => 'required|date',
            'parent_id'    => 'nullable|exists:menus,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $userId = Auth::id();

        $menu = new Menu([
            'title'        => $request->title,
            'route'        => $request->route,
            'order'        => $request->order,
            'status'       => $request->status,
            'published_at' => $request->published_at,
            'parent_id'    => $request->parent_id,
            'position'     => $request->position,
            'created_by'   => $userId,
            'updated_by'   => $userId,
        ]);

        $menu->save();

        return $this->sendResponse("Menu created successfully", $menu, Response::HTTP_CREATED);
    }


    public function show($id)
    {
        $obj = Menu::find($id);
        if (!$obj) {
            return $this->sendError("Menu Not Found", [], Response::HTTP_BAD_REQUEST);
        }
        return $this->sendResponse("Menu information", $obj, Response::HTTP_OK);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title'        => 'sometimes|required|string|max:255',
            'route'        => 'sometimes|required|string|max:255',
            'order'        => 'sometimes|required|integer',
            'status'       => 'sometimes|required|in:draft,published,archived',
            'position'     => 'required|in:top,left',
            'published_at' => 'sometimes|required|date',
            'parent_id'    => 'nullable|exists:menus,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError("Failure", $validator->errors());
        }

        $menu = Menu::find($id);
        if (!$menu) {
            return $this->sendError("Menu not found", [], Response::HTTP_BAD_REQUEST);
        }

        $menu->fill($request->only([
            'title',
            'route',
            'order',
            'status',
            'position'     => 'required|in:top,left',
            'published_at',
            'parent_id'
        ]));

        $menu->updated_by = Auth::id();
        $menu->save();

        return $this->sendResponse("Menu updated successfully", $menu);
    }


    public function destroy($id)
    {
        $obj = Menu::find($id);
        if (!$obj) {
            return $this->sendError("Id does not exist", [], Response::HTTP_BAD_REQUEST);
        }

        $obj->delete();

        return $this->sendResponse("Menu deleted Successfully", []);
    }
}
