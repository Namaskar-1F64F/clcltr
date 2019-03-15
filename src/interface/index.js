import Logger from '../util/logger';
import { sendTelegramMessage, sendTelegramInlineResponse } from './telegram';
import { EventEmitter } from 'events';
import { loadConnection, saveConnection } from './connection';

class InterfaceEmitter extends EventEmitter {
  constructor() {
    super();
  }

  receiveMessage(connection, message) {
    Logger.info(`Emit message event.`);
    this.emit('message', connection.id, message);
  }
}

export const interfaceEmitter = new InterfaceEmitter();

export const sendMessage = async (id, message, options) => {
  const connection = await loadConnection(id);
  if (connection != null && connection.platform == 'telegram') {
    Logger.info(`Send telegram message.`);
    if (connection.type == 'message')
      sendTelegramMessage(connection, message, options);
    else if (connection.type == 'inline')
      sendTelegramInlineResponse(connection, message);
  }
}

export const receiveMessage = async (connection, message) => {
  const success = await saveConnection(connection);
  Logger.info('Receive Message');
  if (success) {
    Logger.info(`Emit message event.`);
    interfaceEmitter.receiveMessage(connection, message);
  }
}