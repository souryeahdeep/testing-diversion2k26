const BITBUCKET_API = "https://api.bitbucket.org/2.0";

export async function createBitbucketIssue({
  title,
  description,
  repo,
}: {
  title: string;
  description: string;
  repo: string;
}) {
  const workspace = process.env.BITBUCKET_WORKSPACE;
  const username = process.env.BITBUCKET_USERNAME;
  const appPassword = process.env.BITBUCKET_APP_PASSWORD;

  if (!workspace || !username || !appPassword) {
    throw new Error("Missing Bitbucket credentials in environment variables");
  }

  const credentials = Buffer.from(`${username}:${appPassword}`).toString("base64");

  const res = await fetch(
    `${BITBUCKET_API}/repositories/${workspace}/${repo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        content: { raw: description },
        kind: "bug",
        priority: "major",
      }),
    }
  );

  const rawText = await res.text();
  console.log("Bitbucket response status:", res.status);
  console.log("Bitbucket response body:", rawText);

  let data: any = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { message: rawText };
  }

  if (!res.ok) {
    throw new Error(
      data.error?.message ||
      data.message ||
      `Bitbucket API error (${res.status})`
    );
  }

  if (!data.links?.html?.href) {
    throw new Error("Bitbucket API did not return issue URL");
  }

  return {
    issueUrl: data.links.html.href,
    issueId: data.id,
  };
}