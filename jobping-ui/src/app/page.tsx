import type { Metadata } from "next";
import LandingPage from "../components/LandingPage";

export const metadata: Metadata = { title: "JobPing — Get pinged. Get ahead.", description: "Discover tech internships and new grad roles with matching alerts and a daily recap." };

export default function Home() { return <LandingPage />; }
