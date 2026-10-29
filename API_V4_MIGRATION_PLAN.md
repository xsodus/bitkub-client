# Bitkub API v4 migration plan

Prepared on 13 October 2026 from the repository and official API documentation. Implementation follows this plan, with trading and server time remaining on v3.

## Scope and recommendation

Use endpoint-specific versions. V4 covers wallet, crypto, and fiat operations; market data, trading, and server time remain on v3. The v3 changelog says market balances were removed on 26 May 2026. Sources: [v4 documentation](https://github.com/bitkub/bitkub-official-api-docs/blob/master/rest-v4.md), [v3 documentation](https://github.com/bitkub/bitkub-official-api-docs/blob/master/rest-v3.md).

Recommend a package 3.0 release that migrates existing functionality, with optional v4 endpoint expansion afterward. Package versions and upstream API versions are separate. Do not change every `/v3` path to `/v4`.

## Existing method inventory

Paths below are relative to the existing base URL, `https://api.bitkub.com/api`.

| Method | Current route | Planned route |
| --- | --- | --- |
| `getServerTime()` | GET `/v3/servertime` | Keep |
| `getBalances()` | POST `/v3/market/balances` | GET `/v4/wallet/balances` |
| `getSymbols()` | GET `/market/symbols` | GET `/v3/market/symbols` |
| `getBids()` | GET `/market/bids` | GET `/v3/market/bids` |
| `getAsks()` | GET `/market/asks` | GET `/v3/market/asks` |
| `placeBid()` / `placeAsk()` | POST `/v3/market/place-*`, including test routes | Keep; verify current contracts |
| `cancelOrder()` | POST `/v3/market/cancel-order` | Keep |

V3 market data uses `BTC_THB` symbols and object-shaped bid/ask entries. Current types and fixtures still describe legacy symbols and tuples. Update these together with the routes. Source: [v3 market data](https://github.com/bitkub/bitkub-official-api-docs/blob/master/rest-v3.md#market-data-read-only).

## PR 1: Signing and request construction

Files: `src/BitkubClient.ts`, `src/BitkubClient.test.ts`, signing fixtures.

- Retain the constructor, configurable base URL, Axios response return convention, and fresh server-time request per authenticated call.
- Introduce one internal authenticated request helper. Serialize query parameters or JSON exactly once, then use those same bytes for signing and transport.
- Keep the public `buildRequestHeaders()` helper, with its documented path convention relative to `/api`. Define GET parameters as query parameters; reject ambiguous combinations of a query already in the path and a separate payload.
- Prevent missing or duplicate `/api` prefixes. Omit undefined parameters, preserve zero values, and specify deterministic query encoding.
- Remove the current possibility of appending JSON to a GET signing token.

V4 uses HMAC-SHA256 over timestamp, method, API path, and query/body, with a millisecond timestamp from v3 server time. Source: [authentication](https://github.com/bitkub/bitkub-official-api-docs/blob/master/rest-v4.md#authentication).

Acceptance: independently calculated signature vectors pass for GET with/without query and POST, including encoding, optional fields, and concurrent requests. Nock checks the actual headers, URL, and body, rather than only response snapshots.

## PR 2: Wallet migration and public contracts

Files: `src/BitkubClient.ts`, `src/models.ts`, `src/index.ts`, wallet mocks and tests.

- Switch `getBalances()` to the v4 route and expose native response types.
- Add `getWalletAssets()` as the companion wallet method.
- Add a typed optional wallet query object.
- Export the new response and item types; update the existing `BitkubBalancesReturnType` alias to the new contract in the major release.
- Keep v3 numeric error types separate from v4 response/error types. Accept unknown future v4 error codes without losing their message or payload.
- Preserve Axios rejection behavior and error response details; do not introduce automatic business-error exceptions in this migration.

Wallet responses use `code/message/data`; balances are currency entries with decimal strings and a total, and the documented segment is funding. Crypto/wallet success uses string zero, while fiat examples use numeric zero. Model endpoint-specific envelopes and recognize both where needed. Source: [v4 specification](https://github.com/bitkub/bitkub-official-api-docs/blob/master/rest-v4.md).

Acceptance: success, empty data, precision preservation, unknown codes, authentication failures, and HTTP errors are covered. Confirm funding balances meet existing consumer needs before release; do not silently coerce them into the old numeric balance map.

## PR 3: Current market-data support

Files: `src/BitkubClient.ts`, `src/models.ts`, market mocks, tests and snapshots.

- Move the three existing market-data methods to their documented v3 routes.
- Replace legacy symbol metadata and bid/ask tuple models with current response types.
- Make public market-data calls without requesting server time or signing headers.
- Update examples consistently and describe the response changes alongside the wallet changes.
- Retain existing order and cancellation behavior; add request assertions to detect accidental route, payload, or environment changes.

Acceptance: public calls work without credentials; market fixtures match current documentation; both test and production order routes remain covered with mocks.

## PR 4: Consumer guide and release validation

- Update README, generated API documentation, and migration notes with before/after balance access and market-data examples.
- Explain that TEST currently controls order placement only. Do not imply it provides a sandbox for other account mutations.
- Remove the blanket claim that the package only uses v3. Do not require new credentials solely because wallet routes change; verify permissions separately.
- Run `yarn build` and `yarn test`, meeting the existing 80% line coverage threshold. Disable outbound network access in mocked tests and use fixed dummy credentials.
- Check emitted declaration exports and representative consumer TypeScript examples.
- Validate on the Node versions used by PR CI and publishing, currently 18 and 24 respectively.
- Optionally run a separately enabled, read-only smoke check with supplied credentials. Automated validation must not place live orders or withdraw funds.
- Release 3.0 with explicit breaking-change notes. Confirm wallet equivalence and consumer migration before publication; reverting to the removed balance route is not a viable rollback.

## Optional follow-up: broader v4 coverage

Add typed crypto address, history, coin metadata, compensation, and fiat methods in separate PRs. These are new capabilities: this repository currently wraps none of them.

Keep pagination and payload models endpoint-specific. Crypto withdrawal requires a network and string amount; fiat withdrawal accepts a numeric amount. Fiat pagination requires page and limit together. Source: [v4 endpoints](https://github.com/bitkub/bitkub-official-api-docs/blob/master/rest-v4.md#endpoints).

Add read methods before mutation methods. For mutations, define TEST behavior explicitly, assert the exact signed payload in mocks, and avoid automatic retries after ambiguous timeouts. For read throttling, use bounded retries and preserve HTTP 429 details. Do not assume documented idempotency where none exists.

## Completion criteria

All existing methods use documented routes and accurate exported contracts; wallet precision is preserved; signing tests verify wire requests; trade environment behavior is preserved; build and CI pass; and a consumer can migrate using the guide without guessing response shapes.
