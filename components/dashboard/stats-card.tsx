import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  href: string;
  color: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
  blue: "bg-blue-50 border-blue-200 text-blue-600",
  green: "bg-green-50 border-green-200 text-green-600",
  purple: "bg-purple-50 border-purple-200 text-purple-600",
  orange: "bg-orange-50 border-orange-200 text-orange-600",
};

export function StatsCard({
  title,
  value,
  icon,
  href,
  color,
}: StatsCardProps) {
  return (
    <Link href={href}>
      <div
        className={`p-6 rounded-lg border ${colorClasses[color]} cursor-pointer hover:shadow-lg transition`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <span className="text-4xl opacity-50">{icon}</span>
        </div>
      </div>
    </Link>
  );
}
