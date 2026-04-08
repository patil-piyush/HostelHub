import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api";

export default function WardenStudentMovement() {
  const [movement, setMovement] = useState([]);
  const [showAll, setShowAll] = useState(false);

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getReadableStatus = (status: string) =>
    status === "OUT" ? "On Leave" : "Returned";

  const getStatusClass = (status: string) => {
    return status === "OUT"
      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      : "bg-green-500/10 text-green-400 border-green-500/20";
  };

  // ✅ FILTERED DATA
  const filteredMovement = showAll
    ? movement
    : movement.filter((m: any) => m.status === "OUT");

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* 🔥 HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Student Movement
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor real-time hostel movement activity
            </p>
          </div>

          {/* Toggle */}
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition"
          >
            {showAll ? "Show Only Outside" : "Show All"}
          </button>
        </div>

        {/* 🔥 STATS CARD */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-elevated p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Currently Outside</p>
            <h2 className="text-2xl font-bold text-orange-400">
              {movement.filter((m: any) => m.status === "OUT").length}
            </h2>
          </div>

          <div className="card-elevated p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Total Logs</p>
            <h2 className="text-2xl font-bold text-foreground">
              {movement.length}
            </h2>
          </div>
        </div>

        {/* 🔥 TABLE */}
        <div className="card-elevated rounded-xl overflow-hidden">

          {/* Top Bar */}
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">
              {showAll ? "All Movement Logs" : "Currently Outside"}
            </h3>

            <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {filteredMovement.length} records
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="border-b bg-muted/30">
                  {["Student", "Out Time", "In Time", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs uppercase text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredMovement.length > 0 ? (
                  filteredMovement.map((m: any, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-muted/20 transition"
                    >
                      {/* Student */}
                      <td className="px-6 py-4 font-medium">
                        {m.Student?.name || "Unknown"}
                      </td>

                      {/* Out */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(m.outTime)}
                      </td>

                      {/* In */}
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
                    <td colSpan={4} className="text-center py-10 text-muted-foreground">
                      No movement data available!
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