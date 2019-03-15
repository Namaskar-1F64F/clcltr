import Logger from '../../util/logger';

export default class Connection {
  constructor(id, platform, type) {
    if (id == null) throw new Error('ID can not be null');
    this.id = id;
    Logger.verbose(`Creating connection for ${platform}.`);
    platform = String(platform).toLowerCase();
    if (!['discord', 'telegram', 'slack'].includes(platform)) throw new Error('Only supporting discord/telegram/slack.');
    this.platform = platform;
    this.type = type || 'message';
  }
}