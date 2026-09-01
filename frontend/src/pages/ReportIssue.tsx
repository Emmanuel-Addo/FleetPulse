import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFleet } from "../context/FleetContext";
import {
  ArrowLeft,
  Save,
  X,
  Battery,
  MapPin,
  Wifi,
  Zap,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  User,
  Clock,
  Navigation,
  Radio,
  AlertOctagon,
} from "lucide-react";
import { toast } from "react-toastify";

const ISSUE_CATEGORIES = [
  {
    label: "Battery Depletion",
    icon: Battery,
    desc: "Battery critically low during transit",
  },
  {
    label: "Route Deviation",
    icon: Navigation,
    desc: "Asset deviated from assigned route",
  },
  {
    label: "GPS / Signal Loss",
    icon: Wifi,
    desc: "IoT module GPS unresponsive",
  },
  {
    label: "Emergency SOS",
    icon: AlertOctagon,
    desc: "Driver-triggered emergency alert",
  },
  {
    label: "Engine Fault",
    icon: AlertTriangle,
    desc: "Engine fault code via OBD module",
  },
  {
    label: "Speeding Violation",
    icon: Zap,
    desc: "Asset exceeded zone speed limit",
  },
  {
    label: "Communication Failure",
    icon: Radio,
    desc: "Telemetry stream lost or degraded",
  },
  {
    label: "Unauthorized Stop",
    icon: MapPin,
    desc: "Vehicle stopped outside approved zones",
  },
] as const;

type Category = (typeof ISSUE_CATEGORIES)[number]["label"];
const priorities = ["Low", "Medium", "High", "Critical"] as const;
type Priority = (typeof priorities)[number];

const priorityActive: Record<Priority, string> = {
  Low: "bg-gray-800 text-white border-gray-900",
  Medium: "bg-blue-600 text-white border-blue-700",
  High: "bg-orange-500 text-white border-orange-600",
  Critical: "bg-red-600 text-white border-red-700",
};
const priorityIdle = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";

const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="block text-sm font-semibold text-gray-900 mb-2">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const SectionCard = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const ReportIssue = () => {
  const navigate = useNavigate();
  const { state } = useFleet();
  const assets = useMemo(() => Object.values(state.assets), [state.assets]);

  const [form, setForm] = useState({
    assetId: "",
    category: "" as Category | "",
    priority: "High" as Priority,
    summary: "",
    description: "",
    // Telemetry fields
    deviationDistance: "",
    faultCode: "",
    lastKnownLat: "",
    lastKnownLng: "",
    batteryThreshold: "10",
    speedRecorded: "",
    // Alert metadata
    isEmergency: false,
    dispatchRequired: false,
    assignee: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === form.assetId),
    [assets, form.assetId],
  );

  const set = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleAssetChange = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    setForm((prev) => ({
      ...prev,
      assetId,
      lastKnownLat: asset ? asset.lat.toFixed(6) : "",
      lastKnownLng: asset ? asset.lng.toFixed(6) : "",
      speedRecorded: asset ? String(asset.speed || 0) : "",
      batteryThreshold: asset ? asset.battery.toFixed(0) : "10",
      isEmergency: prev.category === "Emergency SOS",
    }));
    setErrors((prev) => ({ ...prev, assetId: "" }));

    // Auto-suggest category from asset state
    if (!form.category && asset) {
      if (asset.battery < 10) set("category", "Battery Depletion");
      else if (asset.status === "Offline")
        set("category", "Communication Failure");
      else if ((asset.speed || 0) > 70) set("category", "Speeding Violation");
    }
  };

  const handleCategoryChange = (cat: Category) => {
    const asset = selectedAsset;
    const summaries: Record<string, string> = {
      "Battery Depletion": asset
        ? `${asset.name} battery at ${asset.battery.toFixed(0)}% — critically low during active transit`
        : "",
      "Route Deviation": asset
        ? `${asset.name} deviated from assigned dispatch route by ${(Math.random() * 3 + 0.5).toFixed(1)} km`
        : "",
      "GPS / Signal Loss": asset
        ? `${asset.name} GPS module unresponsive — last fix: ${asset.lat.toFixed(4)}, ${asset.lng.toFixed(4)}`
        : "",
      "Emergency SOS": asset
        ? `Emergency SOS triggered by ${asset.driverName || "driver"} in ${asset.name}`
        : "",
      "Engine Fault": asset
        ? `Engine fault code detected in ${asset.name} via IoT OBD module`
        : "",
      "Speeding Violation": asset
        ? `${asset.name} recorded at ${asset.speed} km/h in a restricted zone`
        : "",
      "Communication Failure": asset
        ? `Telemetry stream lost for ${asset.name} — no data received for ${Math.floor(Math.random() * 20 + 5)} minutes`
        : "",
      "Unauthorized Stop": asset
        ? `${asset.name} stopped outside approved delivery zone`
        : "",
    };
    setForm((prev) => ({
      ...prev,
      category: cat,
      summary: prev.summary || summaries[cat] || "",
      isEmergency: cat === "Emergency SOS",
      dispatchRequired: cat === "Emergency SOS" || cat === "Battery Depletion",
    }));
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.assetId) e.assetId = "Please select a vehicle";
    if (!form.category) e.category = "Please select an issue category";
    if (!form.summary.trim()) e.summary = "A summary description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (form.isEmergency) {
      toast.error(
        `🚨 Emergency alert dispatched for ${selectedAsset?.name || "vehicle"}!`,
      );
    } else {
      toast.success(
        `Issue reported successfully for ${selectedAsset?.name || "vehicle"}`,
      );
    }
    navigate("/issues");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/issues")}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Report Telemetry Issue
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Log a fleet alert for dispatch tracking and resolution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/issues")}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition"
          >
            <X size={14} /> Discard
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm ${
              form.isEmergency
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-900 hover:bg-gray-700 text-white"
            }`}
          >
            <Save size={14} />{" "}
            {form.isEmergency ? "Dispatch Emergency" : "Save Issue"}
          </button>
        </div>
      </div>

      {/* Emergency banner */}
      {form.isEmergency && (
        <div className="flex items-center gap-3 bg-red-600 text-white rounded-2xl px-5 py-4">
          <AlertOctagon size={20} className="shrink-0" />
          <div>
            <p className="font-bold text-sm">Emergency SOS Selected</p>
            <p className="text-sm text-red-100 mt-0.5">
              This issue will be immediately escalated to all dispatchers and
              flagged as critical.
            </p>
          </div>
        </div>
      )}

      {/* 1. Issue Category */}
      <SectionCard
        title="Issue Category"
        desc="Select the type of telemetry alert or fleet incident"
      >
        <div className="grid grid-cols-2 gap-3">
          {ISSUE_CATEGORIES.map(({ label, icon: Icon, desc }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleCategoryChange(label)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition ${
                form.category === label
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 mt-0.5 ${form.category === label ? "text-white" : "text-gray-500"}`}
              />
              <div>
                <p
                  className={`text-sm font-bold ${form.category === label ? "text-white" : "text-gray-900"}`}
                >
                  {label}
                </p>
                <p
                  className={`text-xs mt-0.5 ${form.category === label ? "text-gray-300" : "text-gray-500"}`}
                >
                  {desc}
                </p>
              </div>
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="text-sm text-red-500 mt-3">{errors.category}</p>
        )}
      </SectionCard>

      {/* 2. Vehicle & Priority */}
      <SectionCard title="Vehicle & Priority">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label required>Vehicle</Label>
              <div className="relative">
                <select
                  value={form.assetId}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className={`w-full appearance-none border rounded-xl px-4 py-3 text-sm text-gray-900 pr-9 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition ${
                    errors.assetId
                      ? "border-red-400 bg-red-50/20"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select a vehicle</option>
                  {assets.slice(0, 100).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.status} · {a.battery.toFixed(0)}%
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {errors.assetId && (
                <p className="text-sm text-red-500 mt-1.5">{errors.assetId}</p>
              )}
            </div>

            <div>
              <Label>Priority</Label>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("priority", p)}
                    className={`py-2.5 text-sm font-bold rounded-xl border transition ${
                      form.priority === p ? priorityActive[p] : priorityIdle
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Telemetry Snapshot */}
          {selectedAsset && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Live Telemetry — {selectedAsset.name}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    icon: Battery,
                    label: "Battery",
                    value: `${selectedAsset.battery.toFixed(0)}%`,
                    warn: selectedAsset.battery < 15,
                  },
                  {
                    icon: Zap,
                    label: "Speed",
                    value: `${selectedAsset.speed || 0} km/h`,
                    warn: (selectedAsset.speed || 0) > 70,
                  },
                  {
                    icon: MapPin,
                    label: "Latitude",
                    value: selectedAsset.lat.toFixed(5),
                    warn: false,
                  },
                  {
                    icon: MapPin,
                    label: "Longitude",
                    value: selectedAsset.lng.toFixed(5),
                    warn: false,
                  },
                ].map(({ icon: Icon, label, value, warn }) => (
                  <div
                    key={label}
                    className={`rounded-lg p-3 border ${warn ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon
                        size={12}
                        className={warn ? "text-red-500" : "text-gray-400"}
                      />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <p
                      className={`text-base font-bold ${warn ? "text-red-600" : "text-gray-900"}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    selectedAsset.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : selectedAsset.status === "Offline"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {selectedAsset.status}
                </span>
                {selectedAsset.driverName && (
                  <span className="text-sm text-gray-600 flex items-center gap-1.5">
                    <User size={13} className="text-gray-400" />{" "}
                    {selectedAsset.driverName}
                  </span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                  <Clock size={12} /> Just now
                </span>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* 3. Issue Details */}
      <SectionCard title="Issue Details">
        <div className="space-y-5">
          <div>
            <Label required>Summary</Label>
            <input
              type="text"
              placeholder="e.g. Vehicle 42 battery at 3% — active on Route 7"
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition ${
                errors.summary
                  ? "border-red-400 bg-red-50/20"
                  : "border-gray-300 bg-white"
              }`}
            />
            {errors.summary && (
              <p className="text-sm text-red-500 mt-1.5">{errors.summary}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              placeholder="Describe the issue in detail — what was observed in the telemetry stream, when it started, and any additional context..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none bg-white"
            />
          </div>

          {/* Context-specific fields based on category */}
          {form.category === "Route Deviation" && (
            <div>
              <Label>Deviation Distance (km)</Label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 2.4"
                value={form.deviationDistance}
                onChange={(e) => set("deviationDistance", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Distance in km the vehicle has strayed from the assigned route
                path
              </p>
            </div>
          )}

          {form.category === "Engine Fault" && (
            <div>
              <Label>OBD Fault Code</Label>
              <input
                type="text"
                placeholder="e.g. P0401, P0300"
                value={form.faultCode}
                onChange={(e) => set("faultCode", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                OBD-II fault code reported by the vehicle's IoT telemetry module
              </p>
            </div>
          )}

          {form.category === "Speeding Violation" && (
            <div>
              <Label>Recorded Speed (km/h)</Label>
              <input
                type="number"
                placeholder="e.g. 87"
                value={form.speedRecorded}
                onChange={(e) => set("speedRecorded", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>
          )}

          {(form.category === "GPS / Signal Loss" ||
            form.category === "Communication Failure") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Last Known Latitude</Label>
                <input
                  type="text"
                  placeholder="e.g. 41.8781"
                  value={form.lastKnownLat}
                  onChange={(e) => set("lastKnownLat", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                />
              </div>
              <div>
                <Label>Last Known Longitude</Label>
                <input
                  type="text"
                  placeholder="e.g. -87.6298"
                  value={form.lastKnownLng}
                  onChange={(e) => set("lastKnownLng", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* 4. Alert Flags */}
      <SectionCard
        title="Alert Flags"
        desc="Configure how this issue should be handled by the dispatch system"
      >
        <div className="space-y-4">
          {[
            {
              key: "isEmergency",
              label: "Mark as Emergency",
              desc: "Immediately escalate to all dispatchers and trigger priority queue",
            },
            {
              key: "dispatchRequired",
              label: "Dispatch Required",
              desc: "A dispatch unit must be sent to the vehicle location",
            },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-start justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => set(key, !(form as any)[key])}
                className={`relative w-11 h-6 rounded-full transition shrink-0 ml-4 mt-0.5 ${(form as any)[key] ? "bg-gray-900" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form as any)[key] ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5. Assignment */}
      <SectionCard title="Assignment">
        <div>
          <Label>Assign To Dispatcher</Label>
          <div className="relative w-80">
            <select
              value={form.assignee}
              onChange={(e) => set("assignee", e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 pr-9 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Unassigned</option>
              <option>Alex M. — Fleet Dispatcher</option>
              <option>Sarah K. — Route Coordinator</option>
              <option>James O. — Operations Lead</option>
              <option>Rita B. — Maintenance Supervisor</option>
              <option>Daniel F. — Telematics Engineer</option>
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </SectionCard>

      {/* Bottom actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => navigate("/issues")}
          className="text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl transition"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          className={`text-sm font-bold px-8 py-3 rounded-xl transition shadow-sm ${
            form.isEmergency
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-900 hover:bg-gray-700 text-white"
          }`}
        >
          {form.isEmergency ? "🚨 Dispatch Emergency Alert" : "Save Issue"}
        </button>
      </div>
    </div>
  );
};

export default ReportIssue;
