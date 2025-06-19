import { FiUsers, FiUserCheck, FiClock } from 'react-icons/fi';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#003480]">Scan Report</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Total Attendees Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100/70">
              <FiUsers className="h-6 w-6 text-[#003480]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Attendees
              </p>
              <h3 className="text-2xl font-bold text-[#003480] mt-1">120</h3>
            </div>
          </div>
        </div>

        {/* Checked In Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100/70">
              <FiUserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Checked In</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">85</h3>
            </div>
          </div>
        </div>

        {/* Check-in Rate Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100/70">
              <FiClock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Check-in Rate</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">70%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Check-ins Table */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium text-[#003480]">
          Recent Check-ins
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-3 text-left text-sm font-medium text-[#003480]">
                  Badge ID
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#003480]">
                  Name
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#003480]">
                  Email
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#003480]">
                  Check-in Time
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Table rows with cleaner styling */}
              <tr className="border-t border-gray-100">
                <td className="py-4 text-sm font-medium">B12345</td>
                <td className="py-4 text-sm">John Doe</td>
                <td className="py-4 text-sm text-gray-600">
                  john.doe@example.com
                </td>
                <td className="py-4 text-sm text-gray-600">2 minutes ago</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="py-4 text-sm font-medium">B12346</td>
                <td className="py-4 text-sm">Jane Smith</td>
                <td className="py-4 text-sm text-gray-600">
                  jane.smith@example.com
                </td>
                <td className="py-4 text-sm text-gray-600">5 minutes ago</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="py-4 text-sm font-medium">B12347</td>
                <td className="py-4 text-sm">Robert Johnson</td>
                <td className="py-4 text-sm text-gray-600">
                  robert@example.com
                </td>
                <td className="py-4 text-sm text-gray-600">10 minutes ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
