import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getMentorProfile } from "../services/api";

export default function Navbar() {
  const [mentor, setMentor] = useState({
    name: "Mentor",
    role: "Kalvium Dojo Mentor",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMentorProfile();
        if (data.success) {
          setMentor(data.mentor);
        }
      } catch (error) {
        console.error("Failed to load mentor profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <header className="h-16 bg-[#07142D] border-b border-slate-800 flex items-center justify-between px-6">
      {/* Left Logo */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#E63946] flex items-center justify-center">
          <span className="text-white font-black text-lg">K</span>
        </div>

        <div>
          <h1 className="text-white font-bold text-xl">Kalvium</h1>
          <p className="text-slate-400 text-xs">Dojo Pulse</p>
        </div>
      </div>

      {/* Right User */}
      <div className="flex items-center gap-5">
        <button className="text-slate-300 hover:text-white transition">
          <Bell size={21} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#E63946] flex items-center justify-center text-white font-bold">
            {mentor.name?.charAt(0)?.toUpperCase() || "M"}
          </div>

          <div className="hidden sm:block">
            <p className="text-white font-semibold leading-5">
              {mentor.name}
            </p>
            <p className="text-slate-400 text-sm">{mentor.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}