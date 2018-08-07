import {Connector} from './connector';
import {SocketClusterChannel, SocketClusterPrivateChannel, SocketClusterPresenceChannel} from '../channel';

declare function require(name: string);

let cluster = require('socketcluster-client');

declare function require(name: string);

let scStatelessPresenceClient = require('sc-stateless-presence/sc-stateless-presence-client.js');

/**
 * This class creates a connector to a Socket cluster server.
 */
export class SocketClusterConnector extends Connector {
    /**
     * The Socket cluster connection instance.
     *
     * @type {object}
     */
    socket: any;

    /**
     * The Socket cluster presence listener instance.
     *
     * @type {object}
     */
    presence: any;

    /**
     * All of the subscribed channel names.
     *
     * @type {any}
     */
    channels: any = {};

    handlers: string[] = [];

    /**
     * Create a fresh Socket cluster connection.
     *
     * @return void
     */
    connect(): void {
        cluster = this.getSocketCluster();

        this.socket = cluster.create(this.options);

        this.socket.on('connect', () => {
            return this.socket;
        });

        this.socket.on('subscribe', channel => {
            console.log('%cWS: ' + `Connected to channel: "${channel}" successfully.`, 'color: #6639B6');
        });
    }

    onClose(callback) {
        this.socket.on('close', () => {
            callback();
        });
    }

    /**
     * Get socket cluster module from global scope or options.
     *
     * @type {object}
     */
    getSocketCluster(): any {
        if (typeof cluster !== 'undefined') {
            return cluster;
        }

        if (this.options.client !== 'undefined') {
            return this.options.client;
        }

        throw new Error('Socket cluster client not found. Should be globally available or passed via options.client');
    }

    /**
     * Listen for an event on a channel instance.
     *
     * @param  {string} name
     * @param  {string} event
     * @param  {Function} callback
     * @return {SocketClusterChannel}
     */
    listen(name: string, event: string, callback: Function): SocketClusterChannel {
        return this.channel(name).listen(event, callback);
    }

    /**
     * Get a channel instance by name.
     *
     * @param  {string} name
     * @return {SocketClusterChannel}
     */
    channel(name: string): SocketClusterChannel {
        if (!this.channels[name]) {
            this.channels[name] = new SocketClusterChannel(
                this.socket,
                this,
                name,
                this.options
            );
        }

        return this.channels[name];
    }

    /**
     * Get a private channel instance by name.
     *
     * @param  {string} name
     * @return {SocketClusterChannel}
     */
    privateChannel(name: string): SocketClusterPrivateChannel {
        if (!this.channels['private-' + name]) {
            this.channels['private-' + name] = new SocketClusterPrivateChannel(
                this.socket,
                this,
                'private-' + name,
                this.options,
                true
            );
        }

        return this.channels['private-' + name];
    }

    /**
     * Get a presence channel instance by name.
     *
     * @param  {string} name
     * @return {SocketClusterPresenceChannel}
     */
    presenceChannel(name: string): SocketClusterPresenceChannel {
        if (!this.channels['presence-' + name]) {
            this.presence = scStatelessPresenceClient.create(this.socket);
            this.channels['presence-' + name] = new SocketClusterPresenceChannel(
                this.socket,
                this,
                'presence-' + name,
                this.options,
                true,
                this.presence
            );
        }

        return this.channels['presence-' + name];
    }

    /**
     * Leave the given channel.
     *
     * @param  {string} name
     * @return {void}
     */
    leave(name: string): void {
        let channels = [name, 'private-' + name, 'presence-' + name];

        channels.forEach(name => {
            if (this.channels[name]) {
                this.channels[name].unwatch();

                delete this.channels[name];
            }
        });
    }

    /**
     * Get the socket ID for the connection.
     *
     * @return {string}
     */
    socketId(): string {
        return this.socket.id;
    }

    /**
     * Disconnect Socket Cluster connection.
     *
     * @return void
     */
    disconnect(): void {
        console.log('%cWS: Destroying a socketcluster instance', 'color: #6639B6')
        this.socket.destroy();
    }
}