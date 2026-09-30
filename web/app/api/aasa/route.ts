// apple-app-site-association: lets https://<domain>/i/CODE open the Morni app.
export function GET() {
  const teamId = process.env.APPLE_TEAM_ID ?? "TEAMID";
  const bundleId = process.env.IOS_BUNDLE_ID ?? "app.morni.ios";
  const appID = `${teamId}.${bundleId}`;
  return Response.json(
    {
      applinks: {
        details: [
          {
            appIDs: [appID],
            components: [
              { "/": "/i/*", comment: "Invite links" },
              { "/": "/*/i/*", comment: "Localized invite links" },
            ],
          },
        ],
      },
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
