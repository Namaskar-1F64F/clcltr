import Logger from '../util/logger';
import { interfaceEmitter, sendMessage } from '../interface';
import { createClient } from 'wolfram';
import { get } from 'lodash';

Logger.info(`Connected clclt.`);
const wolfClient = createClient(process.env.WOLFRAM_APPID);
interfaceEmitter.on("message", async (id, message) => {
  Logger.info(`Received message in clclt.`);
  let { text, username, title } = message;
  if (text.length > 1 && (text[0] === "/" || text[0] === "!")) {
    if (text.includes('@')) text = text.split('@')[0];
    const fullCommand = text.substring(1);
    const split = fullCommand.split(' ');
    const command = split[0].toLowerCase();
    const args = split.splice(1);
    Logger.info(`Received command from ${username} in chat ${title} (${id}): ${fullCommand}`);
    return commandHandler(command, args, { id, title });
  }
});

const commandHandler = (command, args, context) => {
  if (command == null) {
    return;
  } else if (command == 'calc') {
    const [query] = args;
    calculateCommand({ ...context, query });
  } else if (command == 'start') {
    helpCommand({ ...context });
  } else if (command == 'help') {
    helpCommand({ ...context });
  }
}

const calculateCommand = ({ id, query }) => {
  if (query == null || query == '') {
    const message = `I calculate something if you don't give it to me, HA!`;
    Logger.verbose(message);
    sendMessage(id, { title: 'Calculate', text: message }, { parse_mode: 'Markdown' });
    return;
  }

  wolfClient.query(query, (err, result) => {
    if (err) console.log(err);
    const output = result && result.filter(res => res.title === 'Result');
    if (output.length > 0 && get(output[0], 'subpods[0].value'))
      sendMessage(id, { title: 'Calculate', text: `${query}\n${get(output[0], 'subpods[0].value')}` });
  });
}

const helpCommand = ({ id }) => {
  sendMessage(id, { title: 'Help', text: `Hey I am a super smart calculator.` });
}
