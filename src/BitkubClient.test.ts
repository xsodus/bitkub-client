import BitkubClient from "./BitkubClient";
import {
  BitkubBalancesReturnType,
  BitkubErrorCode,
  BitkubOrderType,
  BitkubSymbolEnum,
  BitkubSymbolReturnType,
} from "./models";

let client: BitkubClient;

const itif = process.env?.IS_FULL_TESTING === "true" ? it : it.skip;

beforeAll(() => {
  client = new BitkubClient(
    process.env.BITKUB_API_KEY || "",
    process.env.BITKUB_API_SECRET || ""
  );
  return true;
});

describe("Bitkub client", () => {
  it("Get server time", async () => {
    const currentServerTime = await client.getServerTime();
    expect(currentServerTime.data).not.toBeNull();
  });

  it("Build a request payload including signature key", async () => {
    const payload = { id: "1234" };
    const result = await client.buildPayload(payload);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("sig");
    expect(result).toHaveProperty("ts");
  });

  it("Get symbols", async () => {
    const result = await client.getSymbols();
    const content: BitkubSymbolReturnType = result.data;

    console.log("Bitkub All Symbols:", content);
    expect(content).toHaveProperty("error", BitkubErrorCode.NO_ERROR);
    expect(content).toHaveProperty("result");
  });

  itif("Get balances", async () => {
    const result = await client.getBalances();
    const content: BitkubBalancesReturnType = result.data;
    expect(content).toHaveProperty("error", BitkubErrorCode.NO_ERROR);
    expect(content).toHaveProperty("result.THB.available");
    expect(content).toHaveProperty("result.THB.reserved");
  });

  it("Get bids", async () => {
    const response = await client.getBids(BitkubSymbolEnum.THB_BTC);
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const [orderId, timestamp, volume, rate, amount] = response.data.result[0];

    expect(orderId).not.toBeUndefined();
    expect(timestamp).not.toBeUndefined();
    expect(volume).not.toBeUndefined();
    expect(rate).not.toBeUndefined();
    expect(amount).not.toBeUndefined();
  });

  it("Get asks", async () => {
    const response = await client.getAsks(BitkubSymbolEnum.THB_BTC);
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const [orderId, timestamp, volume, rate, amount] = response.data.result[0];

    expect(orderId).not.toBeUndefined();
    expect(timestamp).not.toBeUndefined();
    expect(volume).not.toBeUndefined();
    expect(rate).not.toBeUndefined();
    expect(amount).not.toBeUndefined();
  });

  itif("Open position in sandbox environment", async () => {
    // You need to refill THAI baht to your account before calling this.
    const response = await client.placeBid(
      BitkubSymbolEnum.THB_BTC,
      100,
      0,
      BitkubOrderType.MARKET
    );
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const placeBidResultest = response.data.result;

    console.log("placeBidResultest", placeBidResultest);

    expect(placeBidResultest).toHaveProperty("id");
    expect(placeBidResultest).toHaveProperty("hash");
    expect(placeBidResultest).toHaveProperty("typ");
    expect(placeBidResultest).toHaveProperty("amt");
    expect(placeBidResultest).toHaveProperty("rat");
    expect(placeBidResultest).toHaveProperty("fee");
    expect(placeBidResultest).toHaveProperty("cre");
    expect(placeBidResultest).toHaveProperty("rec");
    expect(placeBidResultest).toHaveProperty("ts");
  });

  itif("Close position in sandbox environment", async () => {
    const response = await client.placeAsk(
      BitkubSymbolEnum.THB_KUB,
      0.1,
      0,
      BitkubOrderType.MARKET
    );
    const { error } = response.data;
    const isCheckingBody = error === BitkubErrorCode.NO_ERROR;
    const isEmptyWallet = error === BitkubErrorCode.EMPTY_WALLET;
    const isLowAmount = error === BitkubErrorCode.LOW_AMOUNT;
    expect(isCheckingBody || isEmptyWallet || isLowAmount).toBeTruthy();

    if (isEmptyWallet)
      console.log("Cannot create a sell order due to empty wallet.");

    if (!isCheckingBody) {
      console.log("No response from server");
      return;
    }

    const placeAskResult = response.data.result;

    console.log("placeAskResult", placeAskResult);

    expect(placeAskResult).toHaveProperty("id");
    expect(placeAskResult).toHaveProperty("hash");
    expect(placeAskResult).toHaveProperty("typ");
    expect(placeAskResult).toHaveProperty("amt");
    expect(placeAskResult).toHaveProperty("rat");
    expect(placeAskResult).toHaveProperty("fee");
    expect(placeAskResult).toHaveProperty("cre");
    expect(placeAskResult).toHaveProperty("rec");
    expect(placeAskResult).toHaveProperty("ts");
  });
});
