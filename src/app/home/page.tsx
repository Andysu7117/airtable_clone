import { requireAuth } from "../_components/auth";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  await requireAuth();
  
  return <HomePageClient />;
}