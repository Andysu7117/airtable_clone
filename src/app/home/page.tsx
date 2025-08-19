import { requireAuth } from "../_components/auth";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const { session, user } = await requireAuth();
  
  return <HomePageClient />;
}