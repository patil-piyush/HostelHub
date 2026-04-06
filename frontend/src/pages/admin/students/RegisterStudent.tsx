import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import API from "@/api";

export default function RegisterStudent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    PRN: "",
    roomNumber: ""
  });

  const handleSubmit = async () => {
    try {
      await API.post("auth/register", {
        ...form,
        roomNumber: Number(form.roomNumber)
      });
      console.log(form);
      alert("Student Registered");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-md">

        <h1 className="text-xl font-bold">Register Student</h1>

        <Input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input placeholder="PRN" onChange={(e) => setForm({ ...form, PRN: e.target.value })} />
        <Input placeholder="Room Number" onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />

        <Button onClick={handleSubmit}>Register</Button>

      </div>
    </DashboardLayout>
  );
}