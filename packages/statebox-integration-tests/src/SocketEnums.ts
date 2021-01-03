export enum WEBSOCKET_STATUS {
	CONNECTING = "CONNECTING",
	CONNECTED = "CONNECTED",
	ERROR = "ERROR",
	RECONNECTING = "RECONNECTING",
	NOT_CONNECTED = "NOT_CONNECTED",
}

export const WEBSOCKET_CLOSE_REASONS: {
	[key: number]: string;
} = {
	1_000: "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.",
	1_001: 'An endpoint is "going away", such as a server going down or a browser having navigated away from a page.',
	1_002: "An endpoint is terminating the connection due to a protocol error",
	1_003: "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).",
	1_004: "Reserved. The specific meaning might be defined in the future.",
	1_005: "No status code was actually present.",
	1_006: "The connection was closed abnormally, e.g., without sending or receiving a Close control frame",
	1_007: "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).",
	1_008: 'An endpoint is terminating the connection because it has received a message that "violates its policy". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.',
	1_009: "An endpoint is terminating the connection because it has received a message that is too big for it to process.",
	1_011: "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.",
	1_015: "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).",
};
