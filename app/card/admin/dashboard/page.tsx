import { getServiceSupabase } from "@/lib/supabase";
import Dashboard from "./Dashboard";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = getServiceSupabase();

  const [{ data: employees }, { data: settings }] = await Promise.all([
    supabase.from("employees").select("*").order("created_at", { ascending: false }),
    supabase.from("company_settings").select("*").eq("id", 1).single(),
  ]);

  return <Dashboard initialEmployees={employees || []} initialSettings={settings} />;
}
