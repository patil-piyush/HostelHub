import { useEffect, useState } from "react";
import API from "@/api";
import { useAllocation } from "@/context/AllocationContext";

export default function EligibleStudents() {

  const { cycle, refreshCycles } = useAllocation();
  const [count, setCount] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cycle) fetch();
  }, [cycle]);

  const fetch = async () => {
    const res = await API.get(`/admin/allocation-cycle/${cycle?.id}/merit-list`);
    setList(res.data);
  };

  const setEligible = async () => {
    try {
      setLoading(true);

      await API.post("/admin/allocation-cycle/set-eligible", {
        cycleId: cycle?.id,
        eligibleCount: Number(count)
      });

      await refreshCycles();
      fetch();

    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "eligible") return "bg-green-100 text-green-700";
    if (status === "waiting") return "bg-gray-100 text-gray-600";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">Eligible Students</h2>
        <p className="text-sm text-muted-foreground">
          Select top students based on merit
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="p-4 border rounded-xl flex gap-3 items-center">
        <input
          type="number"
          placeholder="Enter Top N (e.g. 100)"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="border p-2 rounded w-40"
        />

        <button
          onClick={setEligible}
          disabled={loading || !count}
          className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Set Eligible"}
        </button>
      </div>

      {/* LIST */}
      <div className="border rounded-xl max-h-[400px] overflow-y-auto">

        <div className="grid grid-cols-3 font-semibold p-3 border-b bg-muted">
          <span>Rank</span>
          <span>Name</span>
          <span>Status</span>
        </div>

        {list.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-3 p-3 border-b items-center hover:bg-muted/50"
          >
            <span className="font-medium">#{s.rank}</span>
            <span>{s.Student?.name}</span>
            <span>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(s.status)}`}>
                {s.status}
              </span>
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}