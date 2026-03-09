import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, Download, Users, Star } from "lucide-react";

const cgpaList = [
  { rollNo: "2021CS001", name: "Arjun Sharma", cgpa: 8.7, eligible: true },
  { rollNo: "2021CS002", name: "Priya Kumar", cgpa: 9.1, eligible: true },
  { rollNo: "2021CS003", name: "Rahul Mehta", cgpa: 7.2, eligible: false },
  { rollNo: "2021CS004", name: "Sneha Reddy", cgpa: 8.0, eligible: true },
  { rollNo: "2021CS005", name: "Kiran Patel", cgpa: 6.8, eligible: false },
  { rollNo: "2021CS006", name: "Aditya Kumar", cgpa: 9.5, eligible: true },
];

export default function UploadCGPA() {
  const [threshold, setThreshold] = useState("7.5");
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload CGPA</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload student CGPA data and set eligibility criteria for room allocation</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload */}
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Upload CGPA File
            </h3>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); setUploaded(true); }}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/20"
              }`}
              onClick={() => setUploaded(true)}
            >
              {uploaded ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                  <p className="font-medium text-green-400">File uploaded successfully</p>
                  <p className="text-xs text-muted-foreground">cgpa_data_2024.csv</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Drop CSV file here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports: .csv, .xlsx</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-muted-foreground" />
              <button className="text-sm text-primary hover:underline">Download template CSV</button>
            </div>
          </div>

          {/* Eligibility Settings */}
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Eligibility Criteria
            </h3>
            <div className="space-y-5">
              <div>
                <Label htmlFor="threshold" className="text-sm text-foreground mb-1.5 block">
                  Minimum CGPA Threshold
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="threshold"
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    min="0" max="10" step="0.1"
                    className="bg-input border-border focus:border-primary text-foreground"
                  />
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Save</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Students with CGPA ≥ {threshold} will be eligible for room allocation</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <p className="text-sm font-medium text-foreground">Current Statistics</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Students", value: "328", color: "text-foreground" },
                    { label: "Eligible", value: cgpaList.filter((s) => s.eligible).length.toString(), color: "text-green-400" },
                    { label: "Not Eligible", value: cgpaList.filter((s) => !s.eligible).length.toString(), color: "text-red-400" },
                    { label: "Avg CGPA", value: "8.1", color: "text-primary" },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-2 rounded-lg bg-background">
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-glow-yellow">
                Start Allocation Cycle
              </Button>
            </div>
          </div>
        </div>

        {/* CGPA Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Student CGPA Data
            </h3>
            <span className="text-xs text-muted-foreground">{cgpaList.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Roll No.", "Name", "CGPA", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cgpaList.map((s) => (
                  <tr key={s.rollNo} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{s.rollNo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{s.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${s.cgpa >= 8 ? "text-primary" : s.cgpa >= 7.5 ? "text-green-400" : "text-muted-foreground"}`}>
                        {s.cgpa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={s.eligible ? "status-badge-approved" : "status-badge-rejected"}>
                        {s.eligible ? "Eligible" : "Not Eligible"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
