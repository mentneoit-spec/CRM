import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { busAttendance } from "../../../mockData/transportData";
import AttendanceTable from "../components/AttendanceTable";
import TransportLayout from "../layout/TransportLayout";

function BusAttendancePage() {
  return (
    <TransportLayout title="Bus Attendance">
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceTable rows={busAttendance} />
        </CardContent>
      </Card>
    </TransportLayout>
  );
}

export default BusAttendancePage;
