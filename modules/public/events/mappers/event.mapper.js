export function mapEventStatus(event) {
  const now = new Date();
  const start = new Date(event.startAt);

  const end = event.endAt
    ? new Date(event.endAt)
    : new Date(start.getTime() + 24 * 60 * 60 * 1000);

  let status = "FINISHED";

  if (now < start) status = "UPCOMING";
  else if (now < end) status = "ONGOING";

  return {
    ...event,
    status,
  };
}