import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../services/api';
import {
  Search,
  ArrowUpDown,
  Filter,
  User,
  ChevronRight,
  TrendingUp,
  Minus,
  Award,
  Code2
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('currentBeltLevel');
  const [order, setOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchStudentList = async () => {
      setLoading(true);
      try {
        const data = await getStudents({
          search,
          sort,
          order,
          status: statusFilter
        });
        if (data.success) {
          setStudents(data.students);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchStudentList, 200);
    return () => clearTimeout(timer);
  }, [search, sort, order, statusFilter]);

  const handleStudentClick = (studentId) => {
    navigate(`/students/${encodeURIComponent(studentId)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Student Belt Directory</h1>
          <p className="text-sm text-slate-400">
            Monitor belt levels, earned advancements, and same-day multi-slot test attempts
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start">
          Showing <span className="text-white font-bold">{students.length}</span> students
        </div>
      </div>

      {/* Controls: Search, Filter, Sort */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or batch..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {[
              { id: 'ALL', label: 'All Students' },
              { id: 'IMPROVED', label: 'Improved (Earned Belt)' },
              { id: 'NO_IMPROVEMENT', label: 'No Improvement (0 Belts)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === f.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-medium text-xs cursor-pointer"
            >
              <option value="currentBeltLevel" className="bg-slate-900 text-white">Current Belt Level</option>
              <option value="totalBeltsEarned" className="bg-slate-900 text-white">Belts Earned</option>
              <option value="totalSlotsAttempted" className="bg-slate-900 text-white">Slots Attempted</option>
              <option value="name" className="bg-slate-900 text-white">Name</option>
              <option value="batch" className="bg-slate-900 text-white">Batch</option>
            </select>

            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-0.5 rounded bg-slate-700 text-white font-bold text-[10px] hover:bg-slate-600 transition-colors"
            >
              {order === 'asc' ? 'ASC' : 'DESC'}
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading student belt evaluations...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No students found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Current Belt</th>
                  <th className="px-6 py-4">Belts Earned</th>
                  <th className="px-6 py-4">Slots Count</th>
                  <th className="px-6 py-4">Languages Tested</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr
                    key={student._id || student.studentId}
                    onClick={() => handleStudentClick(student.email || student.studentId)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold group-hover:border-rose-500/50 group-hover:text-rose-400 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-white group-hover:text-rose-400 transition-colors block">
                            {student.name}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {student.email || student.studentId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {student.batch || 'Cohort-1'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        🥋 Belt Level {student.currentBeltLevel}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          student.totalBeltsEarned > 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        +{student.totalBeltsEarned} Belt{student.totalBeltsEarned === 1 ? '' : 's'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {student.totalSlotsAttempted} Attempt{student.totalSlotsAttempted === 1 ? '' : 's'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(student.languagesAttempted || []).map((lang) => (
                          <span
                            key={lang}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {student.improvementStatus === 'IMPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <TrendingUp className="w-3 h-3" /> Improved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Minus className="w-3 h-3" /> No Improvement
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
                        Details <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
