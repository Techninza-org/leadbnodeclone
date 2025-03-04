import { AnalysisCard } from "@/components/analysis-card";
import { BarGraph } from "@/components/Chats/bar-chats";
import { PieChart } from "@/components/Chats/pie-chart";
import DashboardCards from "@/components/dashboard-cards";
import RootManagerDashboardCards from "@/components/root-manager-dashboard-cards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <Card className="bg-inherit mx-auto">
      <CardHeader>
        <CardTitle className="font-bold text-3xl">Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" >
          <RootManagerDashboardCards />
        <div className="lg:grid grid-cols-5 gap-3">
          <BarGraph className="col-span-5" />
          {/* <PieChart className="col-span-2" /> */}
        </div>
      </CardContent>
    </Card>
  );
}
