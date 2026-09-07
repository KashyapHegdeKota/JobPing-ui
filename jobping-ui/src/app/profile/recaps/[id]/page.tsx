import NotificationRecap from "../../../../components/NotificationRecap";

export default async function RecapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NotificationRecap id={id} />;
}
