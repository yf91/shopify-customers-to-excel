import { fetchCountries, fetchShops } from "@/actions/statistics";
import Dashboard from "@/components/pages/dashboard";

export default async function DashboardPage() {
  // const shops = await fetchShops();
  // const countries = await fetchCountries();

  const [shops, countries] = await Promise.all([
    fetchShops(),
    fetchCountries(),
  ]);
  console.log(shops, countries);

  return <Dashboard />;
}
