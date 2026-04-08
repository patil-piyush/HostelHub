import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api";

export default function WardenStudentMovement() {
  const [movement, setMovement] = useState([]);

  useEffect(() => {
    fetchMovement();
  }, []);

  const fetchMovement = async () => {
    try {
      const res = await API.get("/warden/movement");
      setMovement(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Format Date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Status Label
  const getReadableStatus = (status: string) =>
    status === "OUT" ? "On Leave" : "Returned";

  // ✅ Status Styling
  const getStatusClass = (status: string) => {
    return status === "OUT"
      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      : "bg-green-500/10 text-green-400 border-green-500/20";
  };

  // ✅ SORT: OUT first, then IN
  const sortedMovement = [...movement].sort((a: any, b: any) => {
    if (a.status === "OUT" && b.status !== "OUT") return -1;
    if (a.status !== "OUT" && b.status === "OUT") return 1;
    return 0;
  });

  // ✅ COUNT ONLY OUT STUDENTS
  const outsideCount = movement.filter((m: any) => m.status === "OUT").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* 🔥 HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Student Movement
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor all student movement (Outside & Returned)
          </p>
        </div>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-elevated p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Currently Outside
            </p>
            <h2 className="text-2xl font-bold text-orange-400">
              {outsideCount}
            </h2>
          </div>

          <div className="card-elevated p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Total Movement Logs
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              {movement.length}
            </h2>
          </div>
        </div>

        {/* 🔥 TABLE */}
        <div className="card-elevated rounded-xl overflow-hidden">

          {/* Top Bar */}
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">All Movement Logs</h3>

            <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {movement.length} records
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="border-b bg-muted/30">
                  {["Student", "Out Time", "In Time", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs uppercase text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedMovement.length > 0 ? (
                  sortedMovement.map((m: any, i) => (
                    <tr
                      key={i}
                      className={`border-b hover:bg-muted/20 transition ${
                        m.status === "OUT" ? "bg-orange-500/5" : ""
                      }`}
                    >
                      {/* Student */}
                      <td className="px-6 py-4 font-medium">
                        {m.Student?.name || "Unknown"}
                      </td>

                      {/* Out Time */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(m.outTime)}
                      </td>

                      {/* In Time */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {m.inTime ? formatDate(m.inTime) : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${getStatusClass(m.status)}`}
                        >
                          {getReadableStatus(m.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No movement data available 
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}