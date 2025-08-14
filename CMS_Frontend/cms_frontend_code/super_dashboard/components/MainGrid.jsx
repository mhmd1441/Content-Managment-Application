import Copyright from "../internals/components/Copyright";
import PageViewsBarChart from "./PageViewsBarChart";
import SessionsChart from "./SessionsChart";
import StatCard from "./StatCard";

const data = [
  {
    title: "Users",
    value: "14k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Conversions",
    value: "325",
    interval: "Last 30 days",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
  {
    title: "Event count",
    value: "200k",
    interval: "Last 30 days",
    trend: "neutral",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510,
      530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
];

export default function MainGrid() {
  return (
    <div className="w-full max-w-full md:max-w-[1700px] mx-auto">
  <h2 className="text-base font-medium mb-2">Overview</h2>

  <div className="grid grid-cols-12 gap-4 mb-4">
    {data.map((card, index) => (
      <div key={index} className="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard {...card} />
      </div>
    ))}

    <div className="col-span-12 sm:col-span-6 lg:col-span-3" />

    <div className="col-span-12 md:col-span-6">
      <SessionsChart />
    </div>
    <div className="col-span-12 md:col-span-6">
      <PageViewsBarChart />
    </div>
  </div>

  <div className="grid grid-cols-12 gap-4">
    <div className="col-span-12 lg:col-span-9" />
    <div className="col-span-12 lg:col-span-3">
      <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
      </div>
    </div>
  </div>

  <div className="my-8">
    <Copyright />
  </div>
</div>
  );
}
