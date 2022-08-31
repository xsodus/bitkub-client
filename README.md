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

3. Now, you can call the [Bitkub API](https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md) through these functions

- getServerTime
- getSymbols
- getBalances
- getBids
- getAsks
- placeBid
- placeAsk

4. If you want to call other POST APIs which is not in the list above, you can use `buildPayload()` to build your payload. It automatically generates `sig` and `ts` into your payload. They're required fields for all POST APIs.

```
const requestPayload = client.buildPayload({amount:100, ...});
```
