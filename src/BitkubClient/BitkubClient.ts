import axios from "axios";
import crypto from "crypto";
import querystring from "querystring";
import {
  BitkubBalancesReturnType,
  BitkubBidReturnType,
  BitkubEnvironment,
  BitkubHeaderType,
  BitkubOrderType,
  BitkubSymbolEnum,
  BitkubSymbolReturnType,
} from "./types";

const SECURE_API_URL = "https://api.bitkub.com/api";

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
      "x-btk-apikey": apiKey,
      accept: "application/json",
      "content-type": "application/json",
    };
    this.environment = environment;
    console.log("Bitkub ENV", this.environment);
  }

  async getServerTime() {
    return axios.get<string>(`${SECURE_API_URL}/servertime`);
  }

  async buildPayload(params = {}) {
    let payload: Record<string, any> = {
      ...params,
      ts: (await this.getServerTime()).data,
    };
    payload["sig"] = this.generateSignature(payload);
    return payload;
  }

  async getSymbols() {
    return axios.get<BitkubSymbolReturnType>(
      `${SECURE_API_URL}/market/symbols`,
      {
        headers: this.httpHeaders,
      }
    );
  }

  async getBalances() {
    return axios.post<BitkubBalancesReturnType>(
      `${SECURE_API_URL}/market/balances`,
      await this.buildPayload(),
      { headers: this.httpHeaders }
    );
  }

  async getBids(symbol: string, limit = 1) {
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

  async getAsks(symbol: string, limit = 1) {
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

  async placeBid(
    symbol: BitkubSymbolEnum,
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

  async placeAsk(
    symbol: BitkubSymbolEnum,
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
