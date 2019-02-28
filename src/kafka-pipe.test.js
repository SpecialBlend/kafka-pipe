import * as R from 'ramda';
import { KafkaClient } from 'kafka-node';
import { createConsumer, createSender, createTransformer, PipeConsumer } from './kafka-pipe';
import { __kafkaConsumerConstruct, __kafkaProducerConstruct, __kafkaProducerSend } from '../__mocks__/kafka-node';

describe('createConsumer', () => {
    __kafkaConsumerConstruct.mockReset();
    const client = new KafkaClient();
    const topic = 'test.topic';
    const offset = 13;
    const optionalTopicSettings = {
        offset,
    };
    const optionalConsumerSettings = {
        groupId: 'test.group.id',
    };
    const consumer = createConsumer(client, topic, optionalTopicSettings, optionalConsumerSettings);
    test('returns instance of PipeConsumer', () => {
        expect(consumer).toBeInstanceOf(PipeConsumer);
    });
    test('calls Consumer constructor with expected data', () => {
        expect(__kafkaConsumerConstruct).toHaveBeenCalledWith(client, [{
            topic,
            offset,
        }], optionalConsumerSettings);
    });
    test('PipeConsumer.pipe works as expected', () => {
        const callback = jest.fn();
        consumer.pipe(callback);
        consumer.emit('message', 'test.message.0');
        consumer.emit('message', 'test.message.1');
        expect(callback).toHaveBeenCalledWith('test.message.0');
        expect(callback).toHaveBeenCalledWith('test.message.1');
    });
    test('is properly curried', () => {
        expect(typeof createConsumer(client)).toBe('function');
        const testConsumer = createConsumer(client, topic, {}, {});
        expect(createConsumer(client)(topic)).toMatchObject(testConsumer);
        expect(createConsumer(client)(topic, {})).toMatchObject(testConsumer);
        expect(createConsumer(client)(topic, {}, {})).toMatchObject(testConsumer);
    });
});

describe('createSender', () => {
    const client = new KafkaClient();
    const topic = 'test.topic';
    const key = 'test.key';
    const response = 'test.response';
    const messages = ['test.message.0', 'test.message.1'];
    const optionalSendSettings = {
        key,
    };
    const optionalProducerSettings = {
        ackTimeoutMs: 500,
    };
    const sendMessage = createSender(client, topic, optionalSendSettings, optionalProducerSettings);
    test('returns instance of Function', () => {
        expect(typeof sendMessage).toBe('function');
    });
    test('calls Producer constructor with expected data', () => {
        expect(__kafkaProducerConstruct).toHaveBeenCalledWith(client, optionalProducerSettings);
    });
    test('resolver calls Producer.send with expected data', async() => {
        __kafkaProducerSend.mockResolvedValueOnce(response);
        const sendResponse = await sendMessage(messages);
        expect(__kafkaProducerSend).toHaveBeenCalledWith([{
            key,
            topic,
            messages,
        }]);
        expect(sendResponse).toBe(response);
    });
    test('is properly curried', async() => {
        const expectedParams = [{ messages, topic }];
        __kafkaProducerSend.mockReset();
        await createSender(client)(topic)(messages);
        expect(__kafkaProducerSend).toHaveBeenCalledWith(expectedParams);
        __kafkaProducerSend.mockReset();
        await createSender(client)(topic, {})(messages);
        expect(__kafkaProducerSend).toHaveBeenCalledWith(expectedParams);
        __kafkaProducerSend.mockReset();
        await createSender(client)(topic, {}, {})(messages);
        expect(__kafkaProducerSend).toHaveBeenCalledWith(expectedParams);
    });
});

describe('createTransformer', () => {
    __kafkaConsumerConstruct.mockReset();
    __kafkaProducerConstruct.mockReset();
    __kafkaProducerSend.mockReset();
    const client = new KafkaClient();
    const sourceTopic = 'test.source.topic';
    const destinationTopic = 'test.destination.topic';
    const transform = jest.fn(R.reverse);
    const transformer = createTransformer(client, sourceTopic, destinationTopic, transform);
    const message = 'test.message';
    const response = 'test.response';
    test('returns instance of PipeConsumer', () => {
        expect(transformer).toBeInstanceOf(PipeConsumer);
        expect(__kafkaProducerConstruct).toHaveBeenCalledWith(client, {});
        expect(__kafkaConsumerConstruct).toHaveBeenCalledWith(client, [{ topic: sourceTopic }], {});
    });
    test('calls Producer.send with expected data', () => {
        __kafkaProducerSend.mockResolvedValueOnce(response);
        transformer.emit('message', message);
        expect(transform).toHaveBeenCalledWith(message);
        expect(__kafkaProducerSend).toHaveBeenCalledWith([{
            topic: destinationTopic,
            messages: [transform(message)],
        }]);
    });
    test('is properly curried', () => {
        expect(typeof createTransformer(client)).toBe('function');
        expect(typeof createTransformer(client, sourceTopic)).toBe('function');
        expect(typeof createTransformer(client, sourceTopic, destinationTopic)).toBe('function');
        expect(createTransformer(client)(sourceTopic)(destinationTopic)(transform)).toBeInstanceOf(PipeConsumer);
    });
});
