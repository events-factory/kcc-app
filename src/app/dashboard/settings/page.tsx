"use client";

import { Button } from "@/components/ui/button";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Restaurants</h2>
          <Button variant="primary" size="sm" className="flex items-center gap-2">
            <FiPlus className="h-4 w-4" />
            Add Restaurant
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Restaurant Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm">Restaurant A</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <FiEdit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                      <FiTrash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm">Restaurant B</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <FiEdit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                      <FiTrash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm">Restaurant C</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <FiEdit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                      <FiTrash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Event Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="default-limit" className="block text-sm font-medium text-gray-700 mb-1">
              Default Attendee Limit
            </label>
            <input
              type="number"
              id="default-limit"
              defaultValue={100}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex justify-end">
            <Button variant="primary">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
