A wrapper client class for calling Bitkub APIs.

# Installation

By npm

```
npm install bitkub-client
```

By yarn

```
yarn add bitkub-client
```

# How to use

1. Create the APK key and secret from the [Bitkub exchange](https://www.bitkub.com/publicapi)
2. Create an `BitkubClient` object by putting them to the constructor.

```
import BitkubClient, {BitkubEnvironment} from "bitkub-client"

const client = new BitkubClient (
    "[YOUR_API_KEY]",
    "[YOUR_API_SECRET]",
    BitkubEnvironment.PRODUCTION
);
```

3. Now, you can call the [Bitkub API](https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md) through these functions. Please see more details at [bitkub-client document](https://xsodus-bitkub-client.netlify.app).

4. If you want to call other POST APIs which is not in the list above, you can use `buildPayload()` to build your payload. It automatically generates `sig` and `ts` into your payload. They're required fields for all POST APIs.

```
const requestPayload = client.buildPayload({amount:100, ...});
```

# Contributions

## Pull Requests

Feel free to send the PR if you're interested. Thanks!

## Test Running

We only create the integration tests which we can make sure that the request are proceeded in the Bitkub servers.

You can run them through `yarn test`.

To write the test, I suggest to create the mock API by `nock` library. This will avoid changing the account data. And we can ensure the client will call the API correctly. You can see the example test in `BitkubClient.test.ts`
