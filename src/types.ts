export const BITKUB_API_KEY_HEADER_NAME = "x-btk-apikey";
export const CONTENT_TYPE_HEADER_NAME = "content-type";

export enum BitkubErrorCode {
  NO_ERROR = 0,
  EMPTY_WALLET = 17,
  LOW_AMOUNT = 15,
  // TODO : Add more codes
  // Ref: https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md#error-codes
}

export enum BitkubSymbolEnum {
  THB_KUB = "THB_KUB",
  THB_SAND = "THB_SAND",
  THB_BTC = "THB_BTC",
  THB_IOST = "THB_IOST",
  //TODO : Add more symbols
}

type BalanceType = {
  available: number;
  reserved: number;
};

export type BitkubBidReturnType = {
  error: BitkubErrorCode;
  result: Array<any>;
};

export type BitkubHeaderType = {
  [BITKUB_API_KEY_HEADER_NAME]: string;
  accept: string;
  [CONTENT_TYPE_HEADER_NAME]: string;
};

export type BitkubSymbolInfo = {
  id: number;
  info: string;
  symbol: BitkubSymbolEnum;
};

export type BitkubSymbolReturnType = {
  error: BitkubErrorCode;
  result: BitkubSymbolInfo[];
};

export type BitkubBalancesReturnType = {
  error: BitkubErrorCode;
  result: Record<string, BalanceType>;
};

export enum BitkubOrderType {
  LIMIT = "limit",
  MARKET = "market",
}

export enum BitkubEnvironment {
  TEST = "test",
  PRODUCTION = "production",
}

export enum BitkubOrderTypeEnum {
  BUY = "buy",
  SELL = "sell",
}

export type BitkubOrderInfoType = {
  action: string;
  symbol: BitkubSymbolEnum;
};
