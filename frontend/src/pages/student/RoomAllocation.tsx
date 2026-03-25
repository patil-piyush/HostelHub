import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BedDouble, CheckCircle, Users, Building2, Star } from "lucide-react";
import API from "@/api";
import { useEffect } from "react";


export default function RoomAllocation() {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const cgpa = 8.7;
  const eligible = cgpa >= 7.5;
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    API.get("/student/rooms")
      .then(res => setRooms(res.data))
      .catch(console.error);
  }, []);
  
  const handleConfirm = async () => {
    try {
      await API.post("/student/select-room", {
        roomNumber: selected
      });
  
      setConfirmed(true);
  
    } catch (err) {
      console.error(err);
    }
  };


  const handleSelect = (roomNum: string) => {
    if (!eligible) return;
    setSelected(roomNum);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Room Allocation</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and select your hostel room</p>
        </div>

        {/* Eligibility */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card-elevated rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Your CGPA</p>
              <p className="text-3xl font-bold text-primary">{cgpa}</p>
              <p className="text-xs text-muted-foreground">Out of 10.0</p>
            </div>
          </div>
          <div className={`card-elevated rounded-xl p-5 flex items-center gap-4 ${eligible ? "border-green-500/30" : "border-red-500/30"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${eligible ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <CheckCircle className={`w-6 h-6 ${eligible ? "text-green-400" : "text-red-400"}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Eligibility Status</p>
              <p className={`text-xl font-bold ${eligible ? "text-green-400" : "text-red-400"}`}>
                {eligible ? "Eligible" : "Not Eligible"}
              </p>
              <p className="text-xs text-muted-foreground">{eligible ? "CGPA ≥ 7.5 required" : "Minimum CGPA 7.5 required"}</p>
            </div>
          </div>
        </div>

        {confirmed && selected && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Room {selected} has been allocated to you! Pending admin confirmation.</span>
          </div>
        )}

        {/* Rooms Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Available Rooms</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full" />Available</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 bg-muted-foreground rounded-full" />Full</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const isFull = room.occupiedBeds >= room.capacity;
              const isSelected = selected === room.roomNumber;
              return (
                <div
                  key={room.roomNumber}
                  className={`card-elevated rounded-xl p-5 transition-all duration-300 ${isFull ? "opacity-50 cursor-not-allowed" :
                    isSelected ? "border-primary shadow-glow-yellow cursor-pointer" :
                      "hover:border-primary/40 hover:-translate-y-0.5 cursor-pointer"
                    }`}
                  onClick={() => !isFull && handleSelect(room.roomNumber)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BedDouble className="w-4 h-4 text-primary" />
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                    {isFull && <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">Full</span>}
                  </div>
                  <p className="font-bold text-foreground text-lg">{room.num}</p>
                  <p className="text-xs text-muted-foreground">{room.floor} · {room.type}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      <span className={(room.capacity - room.occupiedBeds) > 0 ? "text-green-400 font-medium" : "text-muted-foreground"}>{room.capacity - room.occupiedBeds}</span> / {room.beds} beds
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {room.features.map((f) => (
                      <span key={f} className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selected && !confirmed && (
          <div className="card-elevated rounded-xl p-5 border-primary/30 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Selected: Room {selected}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Confirm your room selection to proceed</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelected(null)} className="border-border">Cancel</Button>
              <Button onClick={handleConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-yellow">
                Confirm Room
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
