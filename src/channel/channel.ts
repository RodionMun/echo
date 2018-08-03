/**
 * This class represents a basic channel.
 */
export abstract class Channel {
    /**
     * The Echo options.
     *
     * @type {any}
     */
    options: any;

    /**
     * Listen for an event on the channel instance.
     *
     * @param  {string} event
     * @param  {Function} callback
     * @return {Channel}
     */
    abstract listen(event: string, callback: Function): Channel;

    /**
     * Listen for an event on the channel instance.
     *
     * @param  {Function} callback
     * @return {Channel}
     */
    notification(callback: Function): Channel {
        return this.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', callback);
    }

    /**
     * Listen for a whisper event on the channel instance.
     *
     * @param  {string} event
     * @param  {Function}   callback
     * @return {Channel}
     */
    listenForWhisper(event: string, callback: Function): Channel {
        return this.listen('.client-' + event, callback);
    }

    isDebug(): boolean {
        if (this.options.hasOwnProperty('debug')) {
            let type: string = typeof this.options.debug;

            if (type === "boolean") {
                return this.options.debug;
            }
            else {
                throw new Error(`Option "debug" should be "boolean"! ${type} given...`);
            }
        }

        return false;
    }
}