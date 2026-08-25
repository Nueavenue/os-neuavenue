# Create a Cloudflare API token (DNS + Workers)

This token lets GitHub Actions run `npx wrangler deploy` for this repo and attach **os.neuavenue.com** / **neuos.neuavenue.com** as Worker custom domains.

Official Cloudflare pages:

- [Create an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- Token list (profile): [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
- [Account ID and zone ID](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/)

Do **not** use the Global API Key. A scoped token is enough and safer.

## 1. Open the token page

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Click your user icon (top right) → **My Profile**.
3. Open **API Tokens**.
4. Click **Create Token**.

Direct link: [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)

## 2. Start from a template, then add DNS

On **Create Token**:

1. Find **Edit Cloudflare Workers** → **Use template**.  
   That fills Workers deploy permissions.
2. Click **Continue to summary** only after you add DNS (next step). Stay on the permission editor.

If you prefer a blank form: **Create Custom Token** → **Get started**.

## 3. Set the permission rows

Token name, for example: `neuOS GitHub deploy`.

You need **two** permission rows (add a row with **+ Add more**):

| # | First dropdown (resource) | Second dropdown (permission) | Third dropdown (level) |
| --- | --- | --- | --- |
| 1 | **Account** | **Workers Scripts** | **Edit** |
| 2 | **Zone** | **DNS** | **Edit** |

Recommended extras (same screen, more rows) so custom domains and account lookup work:

| Resource | Permission | Level | Why |
| --- | --- | --- | --- |
| Account | Account Settings | Read | Lets Wrangler see the account |
| Zone | Workers Routes | Edit | Lets Wrangler bind `os.neuavenue.com` as a route/domain |

The dashboard may say **Edit** or **Write**. Use the full-access option for that row (`Edit` / `Write`), not `Read`.

## 4. Limit which account and zone

Still on the same form:

**Account resources**

- Include → **Specific account** → pick the account that owns **os-neuavenue**.

**Zone resources**

- Include → **Specific zone** → **neuavenue.com** only.  
  Do not choose “All zones” unless you intend this token to change DNS on every domain in the account.

Leave **Client IP Address Filtering** empty unless you know the GitHub Actions IP ranges (you usually do not).

Optional: set an expiration (for example 90 days) if you want the token to rot.

## 5. Create and copy the secret once

1. **Continue to summary**.
2. Confirm the two (or more) permission lines and that the zone is **neuavenue.com**.
3. **Create Token**.
4. Copy the token **now**. Cloudflare will not show it again. Store it in a password manager.

If you lose it, create a new token and delete the old one on the API Tokens list.

## 6. Copy the Account ID

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Select the same account.
3. The URL looks like `https://dash.cloudflare.com/<ACCOUNT_ID>/home`.
4. Or open **Workers & Pages** → **os-neuavenue** → the **Account ID** is in the right-hand overview.

That value is `CLOUDFLARE_ACCOUNT_ID`. It is not secret in the same way as the token, but still keep it in GitHub secrets.

## 7. Put both values in GitHub

Open [Settings → Secrets and variables → Actions](https://github.com/Nueavenue/os-neuavenue/settings/secrets/actions).

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | the token from step 5 |
| `CLOUDFLARE_ACCOUNT_ID` | the account id from step 6 |

Then **Actions** → failed **Deploy Cloudflare** run → **Re-run all jobs**.

The workflow is `.github/workflows/deploy.yml` (`npx wrangler deploy`).

## 8. After a successful deploy

Wrangler will try to attach:

- `os.neuavenue.com`

Alias `neuos.neuavenue.com` in DNS as CNAME to `os.neuavenue.com` **after** that custom domain exists. Delete any hand-made `neuos` record first or Wrangler returns **100117**.

Confirm:

- GitHub Action is green
- https://os.neuavenue.com loads the landing page
- https://neuos.neuavenue.com does the same (or redirects)

## If Create Token is missing

You need a Cloudflare login that can manage **neuavenue.com**. Ask an account Super Administrator. Tokens live under **My Profile**, not under DNS Records.
