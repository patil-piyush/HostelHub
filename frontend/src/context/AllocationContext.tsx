import { createContext, useContext, useEffect, useState } from "react";
import API from "@/api";

const AllocationContext = createContext(null);

export const AllocationProvider = ({ children }) => {

  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/allocation-cycle");

      setCycles(res.data);

      if (selectedCycle) {
        const updated = res.data.find(c => c.id === selectedCycle.id);
        setSelectedCycle(updated || res.data[0]);
      } else if (res.data.length > 0) {
        setSelectedCycle(res.data[0]);
      }

    } finally {
      setLoading(false);
    }
  };

  const selectCycle = (id) => {
    const cycle = cycles.find(c => c.id === id);
    setSelectedCycle(cycle);
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  return (
    <AllocationContext.Provider
      value={{
        cycles,
        cycle: selectedCycle,
        selectCycle,
        refreshCycles: fetchCycles,
        loading
      }}
    >
      {children}
    </AllocationContext.Provider>
  );
};

export const useAllocation = () => useContext(AllocationContext);