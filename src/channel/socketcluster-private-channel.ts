import {SocketClusterChannel} from './socketcluster-channel';

/**
 * This class represents a Socket cluster private channel.
 */
export class SocketClusterPrivateChannel extends SocketClusterChannel {
    /**
     * Trigger client event on the channel.
     *
     * @param  {string}  eventName
     * @param  {object}  data
     * @return {SocketClusterChannel}
     */
    whisper(eventName, data) {
        this.socket.publish(this.name, {
            event: `client-${eventName}`,
            data: data
        });

        return this;
    }
}