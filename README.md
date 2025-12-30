A wrapper client class for calling Bitkub APIs (v3).

# Installation

By npm

```bash
npm install bitkub-client
```

By yarn

```bash
yarn add bitkub-client
```

# How to use

1. Create the API key and secret from the [Bitkub exchange](https://www.bitkub.com/publicapi).
2. Create an `BitkubClient` object by putting them to the constructor.

```typescript
import BitkubClient, { BitkubEnvironment } from "bitkub-client";

const client = new BitkubClient(
  "[YOUR_API_KEY]",
  "[YOUR_API_SECRET]",
  BitkubEnvironment.PRODUCTION // Optional, default is BitkubEnvironment.TEST
);
```

3. Now, you can call the [Bitkub API](https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md) through these functions. Please see more details at [bitkub-client document](https://xsodus-bitkub-client.netlify.app).

```typescript
// Get server time
const serverTime = await client.getServerTime();

// Get current balances
const balances = await client.getBalances();

// Get market symbols
const symbols = await client.getSymbols();

// Place a bid (buy)
const placeBidResponse = await client.placeBid("BTC_THB", 1, 500000);
```

4. If you want to call other POST APIs which are not in the list above, you can use `buildRequestHeaders()` to build your HTTP headers. It includes `X-BTK-TIMESTAMP` and `X-BTK-SIGN` to the headers. They're required fields for all secured APIs for version 3.

```typescript
const uri = `/v3/market/cancel-order`;
const payload = { hash: "..." };
const requestHeaders = await client.buildRequestHeaders("POST", uri, payload);
```

> [!NOTE]
> This client uses Bitkub API version 3. You must generate a new API key on the Bitkub website if you are moving from version 1.x or 2.x.

# Contributions

## Pull Requests

Feel free to send the PR if you're interested. Thanks!

## Test Running

The project uses integration tests to ensure that the requests are correctly processed.

You can run them via:

```bash
yarn test
```

To write a new test, we suggest creating mock APIs using the `nock` library to avoid changing actual account data and ensure consistent test results. You can find examples in `src/BitkubClient.test.ts`.
