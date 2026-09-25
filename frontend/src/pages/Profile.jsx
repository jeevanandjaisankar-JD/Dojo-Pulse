import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Users,
  Award,
  Calendar,
} from "lucide-react";
import { getMentorProfile, getDashboardStats } from "../services/api";

export default function Profile() {
  const [mentor, setMentor] = useState({
    name: "Kalvium Mentor",
    role: "Dojo Mentor",
    email: "",
    phone: "",
    location: "Kalvium",
  });

  const [stats, setStats] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getMentorProfile();
        if (profile?.success && profile.mentor) {
          setMentor(profile.mentor);
        }
      } catch (err) {
        console.log("Profile API not available");
      }

      try {
        const dashboard = await getDashboardStats();
        if (dashboard?.success) {
          setStats(dashboard.stats);
        }
      } catch (err) {
        console.log("Stats API not available");
      }
    };

    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#07142D] to-[#0F172A] border border-red-500/20 p-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#E63946] flex items-center justify-center text-4xl font-black text-white">
            {mentor.name.charAt(0)}
          </div>

          <div>
            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
              VERIFIED MENTOR
            </span>

            <h1 className="text-4xl font-black text-white mt-3">
              {mentor.name}
            </h1>

            <p className="text-slate-300 mt-1">{mentor.role}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold">Contact</h2>

          <div className="flex items-center gap-3 text-slate-300">
            <Mail size={18}/>
            {mentor.email || "Not available"}
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Phone size={18}/>
            {mentor.phone || "Not available"}
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <MapPin size={18}/>
            {mentor.location}
          </div>

          <div className="flex items-center gap-3 text-emerald-400">
            <ShieldCheck size={18}/>
            Active Mentor
          </div>
        </div>

        <div className="lg:col-span-2 grid md:grid-cols-3 gap-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <Users className="text-blue-400 mb-3"/>
            <p className="text-3xl font-black text-white">
              {stats.totalStudents ?? "--"}
            </p>
            <p className="text-slate-400 text-sm">Students</p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <Award className="text-red-400 mb-3"/>
            <p className="text-3xl font-black text-white">
              {stats.totalBeltsEarned ?? "--"}
            </p>
            <p className="text-slate-400 text-sm">Belts Earned</p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <Calendar className="text-purple-400 mb-3"/>
            <p className="text-3xl font-black text-white">
              {stats.totalSlotsHappened ?? "--"}
            </p>
            <p className="text-slate-400 text-sm">Test Slots</p>
          </div>
        </div>
      </div>
    </div>
  );
}