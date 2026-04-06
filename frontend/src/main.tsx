import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AllocationProvider } from "@/context/AllocationContext";

createRoot(document.getElementById("root")!).render(

<AllocationProvider>
  <App />
</AllocationProvider>
);
