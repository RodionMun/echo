import {SocketClusterPrivateChannel} from './socketcluster-private-channel';
import {PresenceChannel} from "./presence-channel";

/**
 * This class represents a Socket cluster presence channel.
 */
export class SocketClusterPresenceChannel extends SocketClusterPrivateChannel implements PresenceChannel {
    /**
     * Register a callback to be called anytime the member list changes.
     *
     * @param  {Function} callback
     * @return {object} SocketClusterPresenceChannel
     */
    here(callback: Function): SocketClusterPresenceChannel {
        this.presence.trackPresence(this.name, () => {
            let members = this.presence.getPresenceList(this.name);
            callback(members);
        });

        return this;
    }

    /**
     * Listen for someone joining the channel.
     *
     * @param  {Function} callback
     * @return {SocketClusterPresenceChannel}
     */
    joining(callback: Function): SocketClusterPresenceChannel {
        this.presence.trackPresence(this.name, function (action) {
            if (action.action === 'join') callback(action.username);
        });

        return this;
    }

    /**
     * Listen for someone leaving the channel.
     *
     * @param  {Function}  callback
     * @return {SocketClusterPresenceChannel}
     */
    leaving(callback: Function): SocketClusterPresenceChannel {
        this.presence.trackPresence(this.name, function (action) {
            if (action.action === 'leave') callback(action.username);
        });

        return this;
    }
}