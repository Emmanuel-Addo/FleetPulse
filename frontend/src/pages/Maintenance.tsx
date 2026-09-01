import React, { useMemo } from "react";
import { useFleet } from "../context/FleetContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Wrench,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Plus,
} from "lucide-react";

type Priority = "High" | "Medium" | "Low";
const getPriority = (asset: { battery: number; status: string }): Priority => {
  if (asset.battery < 15) return "High";
  if (asset.battery < 30 || asset.status === "Maintenance") return "Medium";
  return "Low";
};

const priorityStyle: Record<Priority, string> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

const Maintenance = () => {
  const { state } = useFleet();
  const assets = useMemo(() => Object.values(state.assets), [state.assets]);
  const maintenanceItems = useMemo(
    () =>
      assets
        .filter((a) => a.status === "Maintenance" || a.battery < 30)
        .map((a) => ({
          id: a.id,
          vehicle: a.name,
          driver: a.driverName || "—",
          type: a.type,
          issue:
            a.battery < 15
              ? "Battery Critical"
              : a.battery < 30
                ? "Battery Low"
                : "Scheduled Service",
          priority: getPriority(a),
          battery: a.battery,
          status: a.status,
        })),
    [assets],
  );

  const highCount = maintenanceItems.filter(
    (m) => m.priority === "High",
  ).length;
  const scheduled = maintenanceItems.filter(
    (m) => m.issue === "Scheduled Service",
  ).length;
  const inProgress = assets.filter((a) => a.status === "Maintenance").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Maintenance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track service schedules, issues, and fleet health.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition">
          <Plus size={14} /> Schedule Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "High Priority",
            value: highCount,
            icon: AlertCircle,
            color: "text-red-500",
          },
          {
            label: "In Progress",
            value: inProgress,
            icon: Wrench,
            color: "text-amber-600",
          },
          {
            label: "Scheduled",
            value: scheduled,
            icon: Calendar,
            color: "text-blue-600",
          },
          {
            label: "Completed (30d)",
            value: Math.floor(assets.length * 0.05),
            icon: CheckCircle2,
            color: "text-emerald-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maintenance Queue */}
      <Card>
        <CardHeader className="pb-5">
          <CardTitle>Maintenance Queue</CardTitle>
          <CardDescription>
            {maintenanceItems.length} vehicles require attention
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-6 px-5 py-2.5 border-y border-border bg-secondary text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-2">Vehicle</span>
            <span>Issue</span>
            <span>Battery</span>
            <span>Priority</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {maintenanceItems.slice(0, 100).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-6 px-5 py-4 items-center hover:bg-accent/50 transition-colors"
              >
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {item.vehicle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} · {item.driver}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{item.issue}</p>
                <div className="flex items-center gap-2">
                  <Progress value={item.battery} className="w-16 h-1" />
                  <span className="text-xs text-gray-500">
                    {item.battery.toFixed(0)}%
                  </span>
                </div>
                <Badge
                  variant={priorityStyle[item.priority] as any}
                  className="w-fit"
                >
                  {item.priority}
                </Badge>
                <button className="text-xs font-medium text-gray-700 underline decoration-dotted underline-offset-2 hover:text-black transition">
                  Assign
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
