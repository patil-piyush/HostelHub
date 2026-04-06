import { useEffect, useState } from "react";
import API from "@/api";
import { useAllocation } from "@/context/AllocationContext";

export default function MeritList() {

  const { cycle } = useAllocation();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (cycle) fetchMerit();
  }, [cycle]);

  const fetchMerit = async () => {
    const res = await API.get(`/admin/allocation-cycle/${cycle?.id}/merit-list`);
    setList(res.data);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">Merit List</h2>
        <p className="text-sm text-muted-foreground">
          Students ranked based on CGPA
        </p>
      </div>

      {/* LIST */}
      <div className="border rounded-xl max-h-[400px] overflow-y-auto">

        <div className="grid grid-cols-3 font-semibold p-3 border-b bg-muted">
          <span>Rank</span>
          <span>Name</span>
          <span>CGPA</span>
        </div>

        {list.map((s, index) => (
          <div
            key={s.id}
            className="grid grid-cols-3 p-3 border-b items-center hover:bg-muted/50"
          >
            <span className="font-bold text-primary">
              #{s.rank}
            </span>

            <span>{s.Student?.name}</span>

            <span className="font-medium">
              {s.sgpa}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}