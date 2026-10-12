# bitkub-client

`bitkub-client` is a TypeScript wrapper for selected [Bitkub API v3](https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md) endpoints. It handles API request signing for its authenticated methods and returns Axios responses.

## Install

```bash
npm install bitkub-client
# or
yarn add bitkub-client
```

## Quick start

Create an API key and secret in your [Bitkub account](https://www.bitkub.com/publicapi). Keep the secret private; load credentials from environment variables or another secrets manager instead of committing them to source control.

```typescript
import BitkubClient, { BitkubEnvironment } from "bitkub-client";

const client = new BitkubClient(
  process.env.BITKUB_API_KEY!,
  process.env.BITKUB_API_SECRET!,
  BitkubEnvironment.TEST
);

async function main() {
  const time = await client.getServerTime();
  console.log("Server time:", time.data);

  const symbols = await client.getSymbols();
  console.log("Symbols:", symbols.data.result);

  const balances = await client.getBalances();
  console.log("Balances:", balances.data.result);
}

main().catch(console.error);
```

The constructor defaults to `BitkubEnvironment.TEST`. In this environment, `placeBid` and `placeAsk` call Bitkub's test-order endpoints. Set `BitkubEnvironment.PRODUCTION` to send those orders to the live endpoints. Check the environment before placing a live order.

```typescript
const client = new BitkubClient(
  process.env.BITKUB_API_KEY!,
  process.env.BITKUB_API_SECRET!,
  BitkubEnvironment.PRODUCTION
);
```

## Available methods

| Method | Purpose |
| --- | --- |
| `getServerTime()` | Get Bitkub server time. |
| `getSymbols()` | List market symbols. |
| `getBalances()` | Get balances for the API key. |
| `getBids(symbol, limit?)` | Get bids for a market; limit defaults to `1`. |
| `getAsks(symbol, limit?)` | Get asks for a market; limit defaults to `1`. |
| `placeBid(symbol, amount, rate, orderType?, clientId?)` | Place a buy order. Order type defaults to `BitkubOrderType.MARKET`. |
| `placeAsk(symbol, amount, rate, orderType?, clientId?)` | Place a sell order. Order type defaults to `BitkubOrderType.MARKET`. |
| `cancelOrder(hash, symbol?, orderId?, orderSide?)` | Cancel by order hash, or provide `null` for the hash and identify the order with symbol, ID, and side. |

Methods return an Axios response. The Bitkub response body is in `.data`; for example, `const { data } = await client.getSymbols()`.

### Place and cancel orders

```typescript
import { BitkubOrderType } from "bitkub-client";

// On the TEST environment this uses Bitkub's test-order endpoint.
const order = await client.placeBid(
  "BTC_THB",
  1, // amount
  500000, // rate
  BitkubOrderType.LIMIT
);

// Cancel using the order hash returned by Bitkub.
const cancellation = await client.cancelOrder(order.data.result.hash);

```

You can also cancel with `cancelOrder(null, symbol, orderId, orderSide)` when you do not have the order hash. The side is `"buy"` or `"sell"`.

`placeAsk` takes the same arguments as `placeBid`. Review Bitkub's API documentation for symbol formats, order requirements, and response fields.

## Signing other API requests

For a secured API v3 endpoint that this package does not wrap, use `buildRequestHeaders()` to create the API key, timestamp, and signature headers. Send the request to the same API URL using those headers and the exact method, path, and payload you signed.

```typescript
import axios from "axios";

const path = "/v3/market/cancel-order";
const payload = { hash: "ORDER_HASH" };
const headers = await client.buildRequestHeaders("POST", path, payload);

const response = await axios.post(
  `https://api.bitkub.com/api${path}`,
  payload,
  { headers }
);
```

See [Bitkub's API v3 documentation](https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md) for endpoint requirements. `buildRequestHeaders()` calls Bitkub's server-time endpoint to create the timestamp used in the signature.

## API key version

This package uses Bitkub API v3. If you are upgrading from an API key created for version 1.x or 2.x, create a new API key in Bitkub before using this client.

## Documentation

See the [bitkub-client API documentation](https://xsodus-bitkub-client.netlify.app) for TypeScript types and further details.

## Contributing

Install dependencies and run the integration tests:

```bash
yarn install
yarn test
```

Tests use `nock` to mock Bitkub API requests. Add or update mocks in `src/BitkubClient.test.ts` so tests do not depend on live requests or change account data. Pull requests are welcome.
