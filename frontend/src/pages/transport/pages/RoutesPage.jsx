import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { routes } from "../../../mockData/transportData";
import TransportLayout from "../layout/TransportLayout";

function RoutesPage() {
  return (
    <TransportLayout title="Routes">
      <Card>
        <CardHeader>
          <CardTitle>Manage Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Route Name</th>
                  <th className="px-4 py-3">Bus Number</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Stops</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-gray-900 dark:text-gray-200">
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{route.routeName}</td>
                    <td className="px-4 py-4">{route.busNumber}</td>
                    <td className="px-4 py-4">{route.driver}</td>
                    <td className="px-4 py-4">{route.stops}</td>
                    <td className="px-4 py-4">{route.status}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm">Edit Route</Button>
                        <Button type="button" variant="destructive" size="sm">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </TransportLayout>
  );
}

export default RoutesPage;
