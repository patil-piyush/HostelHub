import DashboardLayout from "@/components/DashboardLayout";
import { useAllocation } from "@/context/AllocationContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import API from "@/api";

import UploadCGPA from "./UploadCGPA";
import MeritList from "./MeritList";
import EligibleStudents from "./EligibleStudents";
import RoomVisualizer from "./RoomVisualizer";

const steps = [
  "draft",
  "merit_generated",
  "eligible_set",
  "selection_open",
  "selection_closed",
  "completed"
];

export default function AllocationHub() {

  const { cycle, cycles, selectCycle, refreshCycles } = useAllocation();
  const [tab, setTab] = useState("upload");
  const [loading, setLoading] = useState(false);

  // ✅ FIXED YEAR OPTIONS (MANUAL)
  const yearOptions = [
    "2025-26",
    "2026-27",
    "2027-28",
    "2028-29",
    "2029-30"
  ];

  const [newYear, setNewYear] = useState(yearOptions[0]);

  // ✅ INPUT STATES
  const [floors, setFloors] = useState("");
  const [roomsPerFloor, setRoomsPerFloor] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("3");
  const [freshersRooms, setFreshersRooms] = useState("0");

  const run = async (fn: Function) => {
    if (!cycle?.id) {
      alert("No cycle selected");
      return;
    }

    try {
      setLoading(true);
      await fn();
      await refreshCycles();
    } catch (err: any) {
      console.error(err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE CYCLE =================
  const createCycle = async () => {
    try {

      // ✅ VALIDATION
      if (!floors || !roomsPerFloor) {
        alert("Please fill all required fields");
        return;
      }

      setLoading(true);

      await API.post("/admin/allocation-cycle", {
        academicYear: newYear,
        floors: Number(floors),
        roomsPerFloor: Number(roomsPerFloor),
        roomCapacity: Number(roomCapacity),
        freshersReservedRooms: Number(freshersRooms)
      });

      await refreshCycles();
      alert("Cycle created successfully");

      // ✅ RESET INPUTS
      setFloors("");
      setRoomsPerFloor("");
      setRoomCapacity("3");
      setFreshersRooms("0");

    } catch (err: any) {
      console.error(err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to create cycle");
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTIONS =================

  const generateMerit = () =>
    run(() =>
      API.post("/admin/allocation-cycle/generate-merit", {
        cycleId: cycle?.id
      })
    );

  const setEligible = () =>
    run(() =>
      API.post("/admin/allocation-cycle/set-eligible", {
        cycleId: cycle?.id,
        eligibleCount: 100
      })
    );

  const openSelection = () =>
    run(() =>
      API.post("/admin/allocation-cycle/open-selection", {
        cycleId: cycle?.id
      })
    );

  const closeSelection = () =>
    run(() =>
      API.post("/admin/allocation-cycle/close-selection", {
        cycleId: cycle?.id
      })
    );

  const completeCycle = () =>
    run(() =>
      API.post("/admin/allocation-cycle/complete", {
        cycleId: cycle?.id
      })
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Allocation Hub</h1>
        </div>

        {/* 🔥 CREATE NEW CYCLE */}
        <div className="flex gap-3 items-center flex-wrap">

          {/* YEAR */}
          <select
            className="p-2 rounded bg-muted"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* FLOORS */}
          <input
            placeholder="Floors"
            value={floors}
            onChange={(e) => setFloors(e.target.value)}
            className="p-2 rounded bg-muted"
          />

          {/* ROOMS PER FLOOR */}
          <input
            placeholder="Rooms/Floor"
            value={roomsPerFloor}
            onChange={(e) => setRoomsPerFloor(e.target.value)}
            className="p-2 rounded bg-muted"
          />

          {/* CAPACITY */}
          <input
            placeholder="Capacity"
            value={roomCapacity}
            onChange={(e) => setRoomCapacity(e.target.value)}
            className="p-2 rounded bg-muted"
          />

          {/* FRESHERS */}
          <input
            placeholder="Freshers Reserved"
            value={freshersRooms}
            onChange={(e) => setFreshersRooms(e.target.value)}
            className="p-2 rounded bg-muted"
          />

          <Button onClick={createCycle} disabled={loading}>
            Create Cycle
          </Button>

        </div>

        {/* 🔥 EXISTING CYCLE SELECTOR */}
        <select
          className="p-2 rounded bg-muted"
          value={cycle?.id || ""}
          onChange={(e) => selectCycle(Number(e.target.value))}
        >
          <option value="">Select Cycle</option>
          {cycles.map(c => (
            <option key={c.id} value={c.id}>
              {c.academicYear} ({c.status})
            </option>
          ))}
        </select>

        {/* STATUS */}
        <div className="p-6 border rounded-xl">
          <p>Status: <b>{cycle?.status}</b></p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 flex-wrap">

          <Button
            disabled={cycle?.status !== "draft" || loading}
            onClick={generateMerit}
          >
            Generate Merit
          </Button>

          <Button
            disabled={cycle?.status !== "merit_generated" || loading}
            onClick={setEligible}
          >
            Set Eligible
          </Button>

          <Button
            disabled={cycle?.status !== "eligible_set" || loading}
            onClick={openSelection}
          >
            Open Selection
          </Button>

          <Button
            disabled={cycle?.status !== "selection_open" || loading}
            onClick={closeSelection}
          >
            Close Selection
          </Button>

          <Button
            disabled={cycle?.status !== "selection_closed" || loading}
            onClick={completeCycle}
          >
            Complete
          </Button>

        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b">
          {["upload", "merit", "eligible", "rooms"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 ${tab === t ? "border-b-2 border-primary" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 border rounded-xl bg-background">

          {tab === "upload" && <UploadCGPA />}
          {tab === "merit" && <MeritList />}
          {tab === "eligible" && <EligibleStudents />}
          {tab === "rooms" && <RoomVisualizer />}

        </div>

      </div>
    </DashboardLayout>
  );
}