import { generateGitHubJWT } from "./GithubJWT";
export async function getInstallationToken() {
  const jwtToken = generateGitHubJWT();

  const response = await fetch(
    `https://api.github.com/app/installations/${process.env.GITHUB_INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const data = await response.json();
  return data.token;
}