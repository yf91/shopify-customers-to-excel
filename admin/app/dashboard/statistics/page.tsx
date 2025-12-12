import { fetchCountries, fetchShops } from "@/actions/statistics";
import Statistics from "@/components/pages/statistics";

export default async function DashboardStatisticsPage() {
  const [shops, countries] = await Promise.all([
    fetchShops(),
    fetchCountries(),
  ]);
  const now = new Date();
  return <Statistics shops={shops} countries={countries} now={now} />;
}
