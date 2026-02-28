export async function sendSlackWebhook(message: string) {
  const response = await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  const result = await response.text();

  console.log("Slack status:", response.status);
  console.log("Slack response:", result);

  return response.ok;
}