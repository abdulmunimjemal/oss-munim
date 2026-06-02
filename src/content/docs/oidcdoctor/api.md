---
title: Programmatic API
description: Use oidcdoctor's reconciler, verifier, Keycloak admin client, PKCE utilities, scaffolders, and MCP server directly from TypeScript.
---

Everything oidcdoctor does is importable. The package ships ESM with type
declarations.

```bash
npm install oidcdoctor
```

## Reconcile an intent against a Keycloak client

```ts
import { reconcile, planClientPatch } from "oidcdoctor";

const report = reconcile(intent, keycloakClient);
// { ok: boolean, findings: Finding[] }

if (!report.ok) {
  const patch = planClientPatch(intent, keycloakClient);
  // patch: KeycloakClientPatch — only the fields that need changing
}
```

`reconcile` is a pure synchronous function — no I/O, no network. It returns
`{ ok, findings }` where `ok` is `true` when no `error`-severity findings remain.
`planClientPatch` returns the **minimal** change set that makes the client
consistent with the intent; URI lists are unioned, not replaced.

## Run the real handshake

```ts
import { verifyLogin } from "oidcdoctor";

const result = await verifyLogin(intent, { username, password });
// {
//   ok: boolean,
//   tokenIssued: boolean,
//   step: FlowStep,           // 'authorize' | 'login_form' | 'credentials' | 'callback' | 'token' | 'done'
//   tokens?: TokenResponse,   // present when ok: true
//   diagnosis?: Finding,      // present when ok: false
// }
```

`verifyLogin` runs the full authorization-code + PKCE handshake over `fetch`.
Inject a custom `fetchImpl` for hermetic testing:

```ts
const result = await verifyLogin(intent, {
  username,
  password,
  fetchImpl: myFakeKeycloakHandler,
});
```

## Use the Keycloak Admin client

```ts
import { KeycloakAdmin, adminOptionsFromIntent, planClientPatch } from "oidcdoctor";

const opts = adminOptionsFromIntent(intent, keycloakAuth);
const admin = new KeycloakAdmin(opts);

const client = await admin.getClient(intent.clientId);  // null if not found
const patch = planClientPatch(intent, client ?? clientFromIntent(intent));
const synced = await admin.syncClient(intent, patch);   // create or PUT
```

`KeycloakAdmin` handles token acquisition (password or client-credentials grant),
client lookup, creation, and patching. All methods are `async`.

## Work with PKCE directly

```ts
import { createPkcePair, createVerifier, challengeFromVerifier, verifyChallenge } from "oidcdoctor";

const { verifier, challenge, method } = createPkcePair("S256");
// verifier: random base64url string
// challenge: SHA-256(verifier) as base64url
// method: "S256"

// Or build the pieces manually:
const verifier = createVerifier();
const challenge = challengeFromVerifier(verifier);
const valid = verifyChallenge(verifier, challenge, "S256");  // true
```

## Scaffold login code

```ts
import { scaffold, FRAMEWORKS } from "oidcdoctor";

const files = scaffold("next", intent);
// GeneratedFile[]: [{ path: "app/api/auth/login/route.ts", contents: "…" }, …]

for (const f of files) {
  writeFileSync(join(outDir, f.path), f.contents);
}

console.log(FRAMEWORKS);  // ["next", "fastapi", "django"]
```

Individual scaffolders are also exported:
`scaffoldNext`, `scaffoldFastapi`, `scaffoldDjango`.

## Build the MCP server

```ts
import { createServer, runStdioServer } from "oidcdoctor";

// Run over stdio (the normal agent-wired path):
await runStdioServer();

// Or build and connect manually:
const server = createServer(options);
await server.connect(transport);
```

`createServer` returns an `McpServer` with four tools: `analyze`,
`verify_login`, `sync_client`, and `scaffold`.

## Install into agents

```ts
import { install, SUPPORTED_AGENTS } from "oidcdoctor";

const results = install(process.cwd(), { agents: ["claude", "cursor"], global: false });
// InstallOutcome[]: [{ agent, action, path }, …]
```

## Work with config

```ts
import { loadConfig, findConfig, parseConfig, CONFIG_FILENAMES } from "oidcdoctor";

const config = loadConfig(".");          // finds and parses oidcdoctor.json
const path = findConfig(".");            // just the path
const config2 = parseConfig(rawJson);   // validate + parse a raw object
```

## OIDC endpoint utilities

```ts
import { endpointsFromIssuer, keycloakIssuer, baseUrlFromIssuer, realmFromIssuer } from "oidcdoctor";

const { authorization, token, logout } = endpointsFromIssuer(issuer);
const issuer = keycloakIssuer(baseUrl, realm);
```

## Full exports

Types: `ClientType`, `FetchImpl`, `Finding`, `FindingCode`, `FlowStep`,
`Framework`, `GeneratedFile`, `KeycloakClient`, `KeycloakClientAttributes`,
`KeycloakClientPatch`, `OidcIntent`, `PkceMethod`, `ReconcileReport`,
`Severity`, `TokenResponse`, `VerifyResult`.

Values: `reconcile`, `planClientPatch`, `applyPatch`, `matchesRedirectPattern`,
`redirectUriAllowed`, `verifyLogin`, `buildAuthorizeUrl`, `diagnoseError`,
`extractFormAction`, `KeycloakAdmin`, `adminOptionsFromIntent`, `clientFromIntent`,
`createPkcePair`, `createVerifier`, `challengeFromVerifier`, `base64url`,
`verifyChallenge`, `scaffold`, `scaffoldNext`, `scaffoldFastapi`, `scaffoldDjango`,
`FRAMEWORKS`, `createServer`, `runStdioServer`, `loadConfig`, `findConfig`,
`parseConfig`, `CONFIG_FILENAMES`, `ConfigSchema`, `install`, `installInto`,
`serverEntry`, `codexSnippet`, `SUPPORTED_AGENTS`, `endpointsFromIssuer`,
`keycloakIssuer`, `baseUrlFromIssuer`, `realmFromIssuer`, `adminClientsUrl`,
`adminTokenUrl`, `VERSION`.
