import TelegramBot from 'node-telegram-bot-api';
import { receiveMessage } from '..';
import InterfaceMessage from '../interfaces/message';
import Connection from '../interfaces/connection';
import { debounce } from 'lodash';

const telegram = new TelegramBot(process.env.CLCLTR_TELEGRAM_TOKEN, { polling: true });

export const sendTelegramMessage = ({ id }, { firstName, text }) => {
  const message = firstName ? `${firstName}: ${text}` : text;
  telegram.sendMessage(id, message, { parse_mode: 'Markdown' });
}

export const sendTelegramInlineResponse = ({ id }, { text, title }) => {
  console.log(text);
  telegram.answerInlineQuery(id,
    [
      { 
        type: 'article',
        id: 1,
        title,
        input_message_content: {
          message_text: text
        },
        description: text
      }
    ]
  )
}

telegram.on("text", async (message) => {
  const { chat: { id, title }, text, from: { first_name: firstName, last_name: lastName, username } } = message;
  const interfaceMessage = new InterfaceMessage({ title, text, username, firstName, lastName });
  const connection = new Connection(id, 'telegram');
  console.log(interfaceMessage);
  receiveMessage(connection, interfaceMessage);
});

const debouncedReceiveMessage = debounce(
  (connection, interfaceMessage) => {
    receiveMessage(connection, interfaceMessage)
  },
500)

telegram.on("inline_query", async (message) => {
  const { id, query: text, from: { first_name: firstName, last_name: lastName, username } } = message;
  const interfaceMessage = new InterfaceMessage({ text, username, firstName, lastName });
  const connection = new Connection(id, 'telegram', 'inline');
  debouncedReceiveMessage(connection, interfaceMessage);
});