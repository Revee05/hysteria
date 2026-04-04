"use client";
import { Calendar, Clock } from "lucide-react";
import { useRef } from "react";

export default function EventDuration({
  form,
  handleChange,
  setForm,
  inputClass
}) {
  const startDateRef = useRef();
  const endDateRef = useRef();
  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const baseInput = `${inputClass} h-[42px] text-sm`;

  return (
    <div className="space-y-2">
      {/* ================= DATE ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--Color-5)]">
            Tanggal Mulai
          </label>
          <div className="relative">
            <input
              ref={startDateRef}
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className={baseInput}
            />
            <button
              type="button"
              onClick={() => startDateRef.current?.showPicker()}
              className="absolute right-3 inset-y-0 flex items-center"
            >
              <Calendar size={16} className="text-[var(--Color-5)] hover:text-[var(--Color-1)] transition" />
            </button>
          </div>
        </div>
      
        {/* End Date */}
        <div className="space-y-1">
          <label className="text-xs text-[var(--Color-5)]">
            Tanggal Selesai
          </label>
        
          <div className="relative">
            <input
              ref={endDateRef}
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className={baseInput}
            />
            <button
              type="button"
              onClick={() => endDateRef.current?.showPicker()}
              className="absolute right-3 inset-y-0 flex items-center"
            >
              <Calendar size={16} className="text-[var(--Color-5)] hover:text-[var(--Color-1)] transition" />
            </button>
          </div>
        </div>
      </div> 

      {/* ================= TIME ================= */}
      {!form.isFlexibleTime && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Start Time */}
          <div className="space-y-1">
            <label className="text-xs text-[var(--Color-5)]">
              Waktu Mulai
            </label>
            <div className="relative">
              <input
                ref={startTimeRef}
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className={baseInput}
              />
              <button
                type="button"
                onClick={() => startTimeRef.current?.showPicker()}
                className="absolute right-3 inset-y-0 flex items-center"
              >
                <Clock size={16} className="text-[var(--Color-5)] hover:text-[var(--Color-1)] transition" />
              </button>
            </div>
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="text-xs text-[var(--Color-5)]">
              Waktu Selesai
            </label>  
            <div className="relative w-full">
              <input
                ref={endTimeRef}
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className={baseInput}
              />
              <button
                type="button"
                onClick={() => endTimeRef.current?.showPicker()}
                className="absolute right-3 inset-y-0 flex items-center"
              >
                <Clock size={16} className="text-[var(--Color-5)] hover:text-[var(--Color-1)] transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLEXIBLE TIME ================= */}
      <label className="flex items-center gap-2 text-sm text-[var(--Color-5)]">
        <input
          type="checkbox"
          checked={form.isFlexibleTime}
          onChange={(e) => {
            const checked = e.target.checked;
            setForm((prev) => ({
              ...prev,
              isFlexibleTime: checked,
              ...(checked ? { startTime: "", endTime: "" } : {}),
            }));
          }}
          className="w-4 h-4 accent-(--Color-1) cursor-pointer"
        />
        Menyesuaikan  
      </label>

      <p className="text-xs text-[var(--Color-1)] leading-relaxed">
        {!form.isFlexibleTime
          ? "Centang jika acara berlangsung lebih dari satu sesi atau waktunya tidak pasti."
          : "Waktu acara akan ditampilkan sebagai fleksibel kepada peserta."}
      </p>
    </div>
  );
}