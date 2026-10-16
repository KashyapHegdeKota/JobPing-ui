import NotificationProfile from "../../components/NotificationProfile";
import ScreeningProfile from "../../components/ScreeningProfile";

export const metadata = {
  title: "The right role. Right away. | JobPing",
  description: "Choose the job alerts and daily recap that fit your search.",
};

export default function ProfilePage() {
  return <>{process.env.NEXT_PUBLIC_SCREENING_ENABLED === "true" && <ScreeningProfile />}<NotificationProfile /></>;
}
