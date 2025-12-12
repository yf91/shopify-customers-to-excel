import { fetchCountries, fetchShops } from "@/actions/statistics";
import Statistics from "@/components/pages/statistics";

export default async function DashboardStatisticsPage() {
  const shops = await fetchShops();
  const countries = await fetchCountries();

  return <Statistics shops={shops} countries={countries} />;
}
