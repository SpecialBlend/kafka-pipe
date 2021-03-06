import { Callable } from '@specialblend/callable';
import { PipeConsumer, createConsumer } from './consumer';
import { Printable } from './printer';
import { Consumer } from 'kafka-node';
import { __construct__ } from '../../__mocks__/support';

describe('PipeConsumer', () => {
    let consumer;
    let eventSpy;
    const client = Symbol('client');
    const topic = Symbol('topic');
    const topicOptions = Symbol('topicOptions');
    const consumerOptions = Symbol('consumerOptions');
    beforeAll(() => {
        consumer = new PipeConsumer(client, topic, topicOptions, consumerOptions);
    });
    test('is a function', () => {
        expect(PipeConsumer).toBeFunction();
    });
    test('calls underlying Consumer with expected props', () => {
        expect(Consumer.prototype[__construct__]).toHaveBeenCalledWith(client, [{ ...topicOptions, topic }], consumerOptions);
    });
    describe('instance', () => {
        test('is also a function', () => {
            expect(consumer).toBeFunction();
        });
        describe('pipe method', () => {
            const handler = jest.fn();
            let afterPipe;
            beforeAll(() => {
                eventSpy = jest.spyOn(consumer, 'on');
                afterPipe = consumer.pipe(handler);
            });
            test('registers message event to handler', () => {
                expect(eventSpy).toHaveBeenCalledWith('message', handler);
            });
            test('is fluent', () => {
                expect(afterPipe).toBe(consumer);
            });
        });
        describe('error method', () => {
            const handler = jest.fn();
            let afterError;
            beforeAll(() => {
                eventSpy = jest.spyOn(consumer, 'on');
                afterError = consumer.error(handler);
            });
            test('registers message event to handler', () => {
                expect(eventSpy).toHaveBeenCalledWith('error', handler);
            });
            test('is fluent', () => {
                expect(afterError).toBe(consumer);
            });
        });
    });
    describe('is Callable', () => {
        test('is instance of Callable', () => {
            expect(consumer).toBeInstanceOf(Callable);
        });
        test('when called, functions as pipe method', () => {
            const handler = jest.fn();
            consumer(handler);
            expect(eventSpy).toHaveBeenCalledWith('message', handler);
        });
    });
    test('is Printable', () => {
        expect(PipeConsumer.prototype).toHaveProperty('print', Printable.prototype.print);
    });
});

describe('createConsumer', () => {
    let result;
    const client = Symbol('client');
    const topic = Symbol('topic');
    const topicOptions = Symbol('topicOptions');
    const consumerOptions = Symbol('consumerOptions');
    beforeAll(() => {
        result = createConsumer(client, topic, topicOptions, consumerOptions);
    });
    test('is a function', () => {
        expect(createConsumer).toBeFunction();
    });
    test('returns instance of PipeConsumer', () => {
        expect(result).toBeInstanceOf(PipeConsumer);
    });
    test('works as expected', () => {
        expect(Consumer.prototype[__construct__]).toHaveBeenCalledWith(client, [{ ...topicOptions, topic }], consumerOptions);
    });
});

describe('createConsumer without options', () => {
    let result;
    const client = Symbol('client');
    const topic = Symbol('topic');
    beforeAll(() => {
        result = createConsumer(client, topic);
    });
    test('is a function', () => {
        expect(createConsumer).toBeFunction();
    });
    test('returns instance of PipeConsumer', () => {
        expect(result).toBeInstanceOf(PipeConsumer);
    });
    test('works as expected', () => {
        expect(Consumer.prototype[__construct__]).toHaveBeenCalledWith(client, [{ topic }], {});
    });
});
