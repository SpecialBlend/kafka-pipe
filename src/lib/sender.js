import { PipeProducer } from './producer';
import * as R from 'ramda';

/**
 * Callable kafka PipeProducer which allows presetting a destination topic and options
 */
export class PipeSender extends PipeProducer {

    /**
     * Curry topic and payload options
     * @param {Client} client kafka client
     * @param {String} topic kafka topic name
     * @param {Object?} payloadOptions options to include with outgoing payloads
     * @param {Object?} producerOptions producer options
     */
    constructor(client, topic, payloadOptions = {}, producerOptions = {}) {
        super(client, producerOptions);
        this.topic = topic;
        this.payloadOptions = payloadOptions;
    }

    /**
     * Send messages to preset topic, with preset options
     * @param {Array<String>} messages an array of messages to send
     * @returns {Promise<*>} returned Promise
     */
    send(messages) {
        const { topic, payloadOptions } = this;
        return super.send({
            ...payloadOptions,
            topic,
            messages,
        });
    }
}

/**
 * Curried factory of PipeProducer
 * @return {PipeSender}
 */
export const createSender = R.curry(
    (client, topic, payloadOptions = {}, producerOptions = {}) =>
        new Promise((resolve, reject) => {
            const sender = new PipeSender(client, topic, payloadOptions, producerOptions);
            sender.on('ready', () => resolve(sender));
            sender.on('error', reject);
        })
);
