import { useEffect, useState } from "react";
import API from "@/api";
import { useAllocation } from "@/context/AllocationContext";
import { Button } from "@/components/ui/button";

export default function RoomVisualizer() {

  const { cycle } = useAllocation();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  // ================= GROUP =================
  const floors = rooms.reduce((acc: any, room: any) => {
    const floor = room.Floor?.floorNumber || 0;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const floorKeys = Object.keys(floors).sort((a, b) => Number(a) - Number(b));

  useEffect(() => {
    if (floorKeys.length > 0 && !floorKeys.includes(selectedFloor)) {
      setSelectedFloor(floorKeys[0]);
    }
  }, [selectedFloor, floorKeys]);

  useEffect(() => {
    if (cycle) fetchRooms();
  }, [cycle]);

  const fetchRooms = async () => {
    const res = await API.get(`/admin/rooms/${cycle?.id}`);
    setRooms([...res.data]);
  };

  // ================= ASSIGN =================
  const assignRoom = async (room: any) => {
    if (!selectedStudent) {
      alert("Enter student PRN");
      return;
    }

    try {
      setLoading(true);

      await API.post("/admin/students/change-room", {   // ✅ FIXED
        PRN: selectedStudent,
        roomId: room.id
      });

      setSelectedStudent("");
      fetchRooms();

    } catch (err: any) {
      alert(err?.response?.data?.message || "Error assigning room");
    } finally {
      setLoading(false);
    }
  };

  // ================= REMOVE =================
  const removeStudent = async (studentId: number) => {
    try {
      setLoading(true);

      await API.post("/admin/remove-student-room", {   // ✅ USE NEW API
        studentId
      });

      fetchRooms();

    } catch (err: any) {
      alert(err?.response?.data?.message || "Error removing student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">

      <h2 className="text-2xl font-bold">Room Visualizer</h2>

      {/* CONTROLS */}
      <div className="flex gap-4 items-center">

        {/* FLOOR SELECT */}
        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded"
        >
          {floorKeys.map(f => (
            <option key={f} value={f}>
              Floor {f}
            </option>
          ))}
        </select>

        {/* STUDENT INPUT */}
        <input
          type="text"
          placeholder="Enter Student PRN"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded w-48 placeholder-gray-400"
        />

      </div>

      {/* ROOMS */}
      <div className="grid grid-cols-4 gap-5">

        {(floors[selectedFloor] || []).map((room: any) => {

          const isFull = room.occupiedBeds >= room.capacity;

          const students = room.Students || [];
          const beds = [];

          for (let i = 0; i < room.capacity; i++) {
            beds.push(students[i] || null);
          }

          return (
            <div
              key={room.id}
              className={`p-4 rounded-2xl border backdrop-blur-md transition-all
          ${isFull
                  ? "bg-red-900/40 border-red-500"
                  : "bg-green-900/30 border-green-500 hover:scale-[1.02]"
                }`}
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-lg">
                  Room {room.roomNumber}
                </h4>

                <span className={`text-xs px-2 py-1 rounded-full
              ${isFull
                    ? "bg-red-500/20 text-red-300"
                    : "bg-green-500/20 text-green-300"
                  }`}>
                  {isFull ? "Full" : "Available"}
                </span>
              </div>

              {/* BEDS */}
              <div className="space-y-2 mb-3">

                {beds.map((student: any, i: number) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-sm flex justify-between items-center
                ${student
                        ? "bg-blue-900/40 text-blue-200"
                        : "bg-gray-800 text-gray-400"
                      }`}
                  >
                    {student ? (
                      <>
                        <span>{student.name}</span>
                        <button
                          onClick={() => removeStudent(student.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span>Empty Bed</span>
                    )}
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  {room.occupiedBeds}/{room.capacity} beds
                </p>
              </div>

              {/* ASSIGN BUTTON */}
              <button
                disabled={isFull || loading}
                onClick={() => assignRoom(room)}
                className={`w-full py-2 rounded-lg font-medium transition
              ${isFull
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-400 text-black"
                  }`}
              >
                Assign
              </button>

            </div>
          );
        })}

      </div>
    </div>
  );
}