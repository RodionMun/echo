import {EventFormatter} from '../util';
import {Channel} from './channel';

import {EventBus} from "./bus/event-bus";
import {SocketClusterConnector} from "../connector/";


/**
 * This class represents a Socket.io channel.
 */
export class SocketClusterChannel extends Channel {
    /**
     * The Socket Cluster client instance.
     *
     * @type {any}
     */
    socket: any;

    /**
     * The name of the channel.
     *
     * @type {object}
     */
    name: any;

    /**
     * The presence channel listener.
     *
     * @type {object}
     */
    protected presence: any;

    /**
     * Channel options.
     *
     * @type {any}
     */
    options: any;

    /**
     * Channel type need auth
     *
     * @type {boolean}
     */
    auth: boolean;

    /**
     * The event formatter.
     *
     * @type {EventFormatter}
     */
    eventFormatter: EventFormatter;

    /**
     * The event callbacks applied to the channel.
     *
     * @type {any}
     */
    events: any = {};

    /**
     * The event bus.
     *
     * @type {EventBus}
     */
    bus: EventBus;

    connector: SocketClusterConnector;

    /**
     * Create a new class instance.
     *
     * @param  {any} socket
     * @param connector
     * @param  {string} name
     * @param  {any} options
     * @param presence
     * @param  {boolean} auth
     */
    constructor(socket: any, connector: SocketClusterConnector, name: string, options: any, auth: boolean = false, presence: any = null) {
        super();

        this.name = name;
        this.socket = socket;
        this.connector = connector;
        this.options = options;
        this.auth = auth;
        this.eventFormatter = new EventFormatter(this.options.namespace);
        this.presence = presence;

        this.subscribe();
    }

    authenticate(data: any): any {
        this.socket.emit('login', data, (err: any) => {
            if (err) {
                console.log('%cWS: ' + `Can not authenticate, invalid permissions for channel: "${data.form.channel_name}".`, 'color: #6639B6');
                console.log('%cWS: ' + `Reason: ${err.message}`, 'color: #6639B6');
            } else {
                console.log('%cWS: ' + `Got permissions: to channel "${data.form.channel_name}" successfully.`, 'color: #6639B6');
            }
        });
    }

    /**
     * Subscribe to a Socket cluster channel.
     *
     * @return {object}
     */
    subscribe(): any {
        if (this.auth && this.socket.authState !== this.socket.AUTHENTICATED) {
            let authData = {
                url: this.options.location + this.options.authEndpoint,
                form: {channel_name: this.name},
                headers: (this.options.auth && this.options.auth.headers) ? this.options.auth.headers : {},
                rejectUnauthorized: false,
                cookie: document.cookie
            };

            this.authenticate(authData);

            this.options = Object.assign(this.options, {waitForAuth: true});
        }
        else {
            console.log('Already authenticated')
        }

        if(!this.connector.handlers.includes('subscribeFail')) {
            this.connector.handlers.push('subscribeFail');

            this.socket.on('subscribeFail', (error) => {
                console.log('%cWS: ' + `Subscribe fail: "${error}".`, 'color: #6639B6')
            });
        }

        if (this.isDebug()) {
            if(!this.connector.handlers.includes('error')) {
                this.connector.handlers.push('error');

                this.socket.on('error', (error) => {
                    console.log(error);
                });
            }
        }

        if (this.isDebug()) {
            if(!this.connector.handlers.includes('connectAbort')) {
                this.connector.handlers.push('connectAbort');

                this.socket.on('connectAbort', (error) => {
                    console.log(error);
                });
            }
        }

        if (this.isDebug()) {
            if(!this.connector.handlers.includes('disconnect')) {
                this.connector.handlers.push('disconnect');

                this.socket.on('disconnect', (error) => {
                    console.log(error);
                });
            }
        }

        this.socket.subscribe(this.name, this.options);

        this.bus = new EventBus();

        let eventsList: string[] = [];

        this.watch((data) => {
            let event: string = data.event;
            let dataObject = data.data;

            if(this.isDebug()) console.log(data, eventsList);

            if (!eventsList.includes(event)) {
                if(this.isDebug()) console.log('%cWS: ' + `Listening to ${event} on channel ${this.name}`, 'color: #6639B6');

                eventsList.push(event);

                this.bus.publish(event, dataObject);
            }
            else if(eventsList.includes(event)) {
                if(this.isDebug()) console.log(`Channel: ${this.name} Event: ${event} Got a new message:`, dataObject);

                this.bus.publish(event, dataObject);
            }
        });
    }

    /**
     * Unsubscribe from channel and unbind event callbacks.
     *
     * @return {void}
     */
    unsubscribe(): void {
        if(this.socket.authState === this.socket.AUTHENTICATED) {
            this.socket.deauthenticate();
        }

        this.socket.unsubscribe(this.name);

        this.bus.unsubscribe(null);
    }

    /**
     * Listen for an event on the channel instance.
     *
     * @param  {string} event
     * @param  {Function} callback
     * @return {SocketClusterChannel}
     */
    listen(event: string, callback: Function): SocketClusterChannel {
        this.bus.subscribe(this.eventFormatter.format(event), callback);

        return this;
    }

    /**
     * Bind the channel's socket to an event and store the callback.
     *
     * @param  {string} event
     * @param  {Function} callback
     */
    on(event: string, callback: Function): void {
        this.socket.on(event, callback);
    }

    /**
     * Unbind the channel's socket from an event and store the callback.
     *
     * @param  {string} event
     * @param  {Function} callback
     */
    off(event: string, callback: Function): void {
        this.socket.off(event, callback);
    }

    /**
     * Bind the channel's socket to an event and store the callback.
     *
     * @param  {Function} callback
     * @return {void}
     */
    watch(callback: Function): void {
        this.socket.watch(this.name, callback);
    }

    /**
     * Unbind the channel's socket from all stored event callbacks.
     *
     * @return {void}
     */
    unwatch(callback?: Function | undefined): void {
        this.socket.unwatch(this.name, callback);
    }
}