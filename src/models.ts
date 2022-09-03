import {
  BITKUB_API_KEY_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
} from "./constants";

export enum BitkubErrorCode {
  NO_ERROR = 0,
  INVALID_JSON_PAYLOAD = 1,
  MISSING_X_BTK_APIKEY = 2,
  INVALID_API_KEY = 3,
  API_PENDING_FOR_ACTIVATION = 4,
  IP_NOT_ALLOWED = 5,
  MISSING_OR_INVALID_SIGNATURE = 6,
  MISSING_TIMESTAMP = 7,
  INVALID_TIMESTAMP = 8,
  INVALID_USER = 9,
  INVALID_PARAMETER = 10,
  INVALID_SYMBOL = 11,
  INVALID_AMOUNT = 12,
  INVALID_RATE = 13,
  IMPROPER_RATE = 14,
  AMOUNT_TOO_LOW = 15,
  FAILED_TO_GET_BALANCE = 16,
  EMPTY_WALLET = 17,
  INSUFFICIENT_BALANCE = 18,
  FAILED_TO_INSERT_ORDER_INTO_DB = 19,
  FAILED_TO_DEDUCT_BALANCE = 20,
  INVALID_ORDER_FOR_CANCELLATION = 21,
  INVALID_SIDE = 22,
  FAILED_TO_UPDATE_ORDER_STATUS = 23,
  INVALID_ORDER_FOR_LOOKUP = 24,
  KEY_LEVEL_1_REQUIRED = 25,
  LIMIT_EXCEEDS = 30,
  PENDING_WITHDRAWAL_EXISTS = 40,
  INVALID_CURRENCY_FOR_WITHDRAWAL = 41,
  ADDRESS_IS_NOT_IN_WHITELIST = 42,
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
