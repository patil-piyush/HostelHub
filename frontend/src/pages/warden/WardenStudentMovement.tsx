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

  // ✅ HUMAN READABLE DATE
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ BETTER STATUS BADGE
  const getStatusClass = (status: string) => {
    switch (status) {
      case "On Leave":
        return "px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "Returned":
        return "px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20";
      default:
        return "px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400";
    }
  };

  const getReadableStatus = (status: string) => {
    return status === "OUT" ? "On Leave" : "Returned";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Movement</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track students currently outside hostel
          </p>
        </div>

        {/* Table Card */}
        <div className="card-elevated rounded-xl overflow-hidden">

          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Currently Outside</h3>

            <span className="px-3 py-1 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {movement.length} students
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Student", "Start", "End", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {movement.length > 0 ? (
                  movement.map((m: any, i) => (
                    <tr key={i}>
                      <td>{m.Student?.name || "Unknown"}</td>

                      <td>{formatDate(m.outTime)}</td>

                      <td>
                        {m.inTime ? formatDate(m.inTime) : "Not Returned"}
                      </td>

                      <td>
                        <span className={getStatusClass(getReadableStatus(m.status))}>
                          {getReadableStatus(m.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  // ✅ EMPTY STATE (IMPORTANT UX)
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-muted-foreground"
                    >
                      No students currently outside 🚫
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