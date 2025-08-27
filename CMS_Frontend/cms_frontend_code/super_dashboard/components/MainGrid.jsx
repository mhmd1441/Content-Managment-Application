import Copyright from "../internals/components/Copyright";
import PageViewsBarChart from "./PageViewsBarChart";
import SessionsChart from "./SessionsChart";
import SessionsTable from "./SessionsTable";
import StatCard from "./StatCard";
import { get_new_users } from "../../src/services/api.js";
import { useEffect, useState } from "react";

export default function MainGrid() {  
const [newUsers, setNewUsers] = useState(0);

  useEffect(() => {
    get_new_users()
      .then((res) => setNewUsers(res.data?.count ?? 0))
      .catch(() => setNewUsers(0));
  }, []);

const cards = [
    {
      title: "New Users This Month",
      value: String(newUsers),
      interval: "This month",
      trend: "up",
      data: [],
    },
  {
    title: "Activity",
    value: "325",
    interval: "Active Users",
    trend: "down",
    data: [
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

  return (
    <div className="w-full max-w-full md:max-w-[1700px] mx-auto">
      <h2 className="text-base font-medium mb-2">Overview</h2>

      <div className="grid grid-cols-12 gap-4 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <StatCard {...card} />
          </div>
        ))}

        <div className="col-span-12 sm:col-span-6 lg:col-span-3" />

        <div className="col-span-12 md:col-span-6">
          <SessionsChart />
          <SessionsTable />
        </div>
        <div className="col-span-12 md:col-span-6">
          <PageViewsBarChart />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-9" />
        <div className="col-span-12 lg:col-span-3">
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4"></div>
        </div>
      </div>

      <div className="my-8">
        <Copyright />
      </div>
    </div>
  );
}
