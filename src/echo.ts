import {Channel, PresenceChannel, SocketClusterPrivateChannel} from './channel'
import {SocketClusterConnector} from './connector';

let axios = require('axios');

/**
 * This class is the primary API for interacting with broadcasting.
 */
export class Echo {

    /**
     * The broadcasting connector.
     *
     * @type {object}
     */
    connector: any;

    /**
     * The Echo options.
     *
     * @type {array}
     */
    options: any;

    /**
     * Create a new class instance.
     *
     * @param  {object} options
     */
    constructor(options: any) {
        this.options = options;

        if (this.options.broadcaster == 'socketcluster') {
            this.connector = new SocketClusterConnector(this.options);
        }
        else {
            throw new Error("Other providers are unsupportable");
        }

        if (typeof axios === 'function') {
            this.registerAxiosRequestInterceptor();
        }
    }

    /**
     * Register an Axios HTTP interceptor to add the X-Socket-ID header.
     */
    registerAxiosRequestInterceptor() {
        axios.interceptors.request.use((config) => {
            if (this.socketId()) {
                config.headers['X-Socket-Id'] = this.socketId();
            }

            return config;
        });
    }

    /**
     * Listen for an event on a channel instance.
     */
    listen(channel: string, event: string, callback: Function) {
        return this.connector.listen(channel, event, callback);
    }

    /**
     * Get a channel instance by name.
     *
     * @param  {string}  channel
     * @return {object}
     */
    channel(channel: string): Channel {
        return this.connector.channel(channel);
    }

    /**
     * Get a private channel instance by name.
     *
     * @param  {string} channel
     * @return {object}
     */
    private(channel: string): SocketClusterPrivateChannel {
        return this.connector.privateChannel(channel);
    }

    /**
     * Get a presence channel instance by name.
     *
     * @param  {string} channel
     * @return {object}
     */
    join(channel: string): PresenceChannel {
        return this.connector.presenceChannel(channel);
    }

    /**
     * Leave the given channel.
     *
     * @param  {string} channel
     */
    leave(channel: string) {
        this.connector.leave(channel);
    }

    /**
     * Get the Socket ID for the connection.
     *
     * @return {string}
     */
    socketId(): string {
        return this.connector.socketId();
    }

    /**
     * Disconnect from the Echo server.
     *
     * @return void
     */
    disconnect(): void {
        this.connector.disconnect();
    }
}