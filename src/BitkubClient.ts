import axios from "axios";
import crypto from "crypto";
import querystring from "querystring";
import {
  BITKUB_API_KEY_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
  SECURE_API_URL,
} from "./constants";
import {
  BitkubBalancesReturnType,
  BitkubBidReturnType,
  BitkubEnvironment,
  BitkubHeaderType,
  BitkubOrderType,
  BitkubSymbolEnum,
  BitkubSymbolReturnType,
} from "./models";

export default class BitkubClient {
  apiKey: string;
  apiSecret: string;
  httpHeaders: BitkubHeaderType;
  environment: BitkubEnvironment;

  constructor(
    apiKey: string,
    apiSecret: string,
    environment: BitkubEnvironment = BitkubEnvironment.TEST
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.httpHeaders = {
      [BITKUB_API_KEY_HEADER_NAME]: apiKey,
      accept: "application/json",
      [CONTENT_TYPE_HEADER_NAME]: "application/json",
    };
    this.environment = environment;
  }

  /**
   * Get server time
   *
   * @returns {string} Bitkub server time
   */
  async getServerTime() {
    return axios.get<string>(`${SECURE_API_URL}/servertime`);
  }

  /**
   * Build a request payload for Bitkub APIs.
   *
   * @param {object} request payload for each API.
   * @returns A request payload including ts and sig field which are required for any POST APIs.
   */
  async buildPayload(params = {}) {
    let payload: Record<string, any> = {
      ...params,
      ts: (await this.getServerTime()).data,
    };
    payload["sig"] = this.generateSignature(payload);
    return payload;
  }

  /**
   * Get market symbols
   *
   * @returns A list of symbols in Bitkub market.
   */
  async getSymbols() {
    return axios.get<BitkubSymbolReturnType>(
      `${SECURE_API_URL}/market/symbols`,
      {
        headers: this.httpHeaders,
      }
    );
  }

  /**
   * Get current balances
   *
   * @returns A list of current balances
   */
  async getBalances() {
    return axios.post<BitkubBalancesReturnType>(
      `${SECURE_API_URL}/market/balances`,
      await this.buildPayload(),
      { headers: this.httpHeaders }
    );
  }

  /**
   * Get bid list from Bitkub
   *
   * @param symbol - Trading Symbol (BNB_THB, BTC_THB)
   * @param limit - Response Limit Size
   * @returns A list of bid
   */
  async getBids(symbol: string | BitkubSymbolEnum, limit = 1) {
    const params = {
      sym: symbol,
      lmt: limit,
    };
    const queryParams = querystring.stringify(await this.buildPayload(params));
    return axios.get<BitkubBidReturnType>(
      `${SECURE_API_URL}/market/bids?${queryParams}`,
      {
        headers: this.httpHeaders,
      }
    );
  }

  /**
   * Get ask list from Bitkub
   *
   * @param symbol - Trading Symbol (THB_BNB, THB_BTC)
   * @param limit - Response Limit Size
   * @returns A list of ask
   */
  async getAsks(symbol: string | BitkubSymbolEnum, limit = 1) {
    const params = {
      sym: symbol,
      lmt: limit,
    };
    const queryParams = querystring.stringify(await this.buildPayload(params));
    return axios.get(`${SECURE_API_URL}/market/asks?${queryParams}`, {
      headers: this.httpHeaders,
    });
  }

  generateSignature(payload: Record<string, any>) {
    const json = JSON.stringify(payload);
    const hash = crypto
      .createHmac("sha256", this.apiSecret)
      .update(json)
      .digest("hex");
    return hash;
  }

  /**
   * Place bid
   * @param symbol - Trading Symbol (THB_BNB, THB_BTC)
   * @param amount - Buy amount
   * @param rate - Price rate
   * @param orderType - Order type (LIMIT, MARKET)
   * @returns Result of placing bid
   */
  async placeBid(
    symbol: BitkubSymbolEnum | string,
    amount: number,
    rate: number,
    orderType: BitkubOrderType = BitkubOrderType.MARKET,
    clientId = undefined
  ) {
    const params: Record<string, any> = {
      sym: symbol,
      amt: amount,
      rat: rate,
      typ: orderType,
    };
    if (clientId) params["client_id"] = clientId;

    return axios.post(
      `${SECURE_API_URL}/market/place-bid${
        this.environment === BitkubEnvironment.TEST ? "/test" : ""
      }`,
      await this.buildPayload(params),
      { headers: this.httpHeaders }
    );
  }

  /**
   * Place ask
   * @param symbol - Trading Symbol (THB_BNB, THB_BTC)
   * @param amount - Sell amount
   * @param rate - Price rate
   * @param orderType - Order type (LIMIT, MARKET)
   * @returns Result of placing ask
   */
  async placeAsk(
    symbol: BitkubSymbolEnum | string,
    amount: number,
    rate: number,
    orderType: BitkubOrderType = BitkubOrderType.MARKET,
    clientId = undefined
  ) {
    const params: Record<string, any> = {
      sym: symbol,
      amt: amount,
      rat: rate,
      typ: orderType,
    };
    if (clientId) params["client_id"] = clientId;

    return axios.post(
      `${SECURE_API_URL}/market/place-ask${
        this.environment === BitkubEnvironment.TEST ? "/test" : ""
      }`,
      await this.buildPayload(params),
      { headers: this.httpHeaders }
    );
  }
}
