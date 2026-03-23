import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

/**
 * Initializes and logs into the Telegram MTProto API.
 */
export const initializeTelegramLogin = async ({
  apiId,
  apiHash,
  phoneNumber,
  phoneCodeCallback,
  passwordCallback,
  onErrorCallback,
}) => {
  const stringSession = new StringSession(""); 
  
  const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: phoneNumber,
    phoneCode: phoneCodeCallback,
    password: passwordCallback,
    onError: onErrorCallback,
  });

  const token = client.session.save(); // Save this string to avoid logging in again
  
  return { client, token };
};

let activeClient = null;

/**
 * Connects directly using a saved StringSession token.
 */
export const getConnectedClient = async (apiId, apiHash, sessionToken) => {
  if (activeClient && activeClient.connected) {
    return activeClient;
  }

  const stringSession = new StringSession(sessionToken);
  const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
    connectionRetries: 5,
  });
  
  await client.connect(); // Actually connects directly using the token
  activeClient = client;
  
  return client;
};
