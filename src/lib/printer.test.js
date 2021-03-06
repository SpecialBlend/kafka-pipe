import { defaultPrinter, Printable } from './printer';

describe('Printable.print', () => {
    let printable;
    let printableSpy;
    let result;
    const testPrinterMessage = 'message qwzaesxrdcftvyubnimo';
    const printer = jest.fn();
    beforeAll(() => {
        printable = new Printable;
        printableSpy = jest.spyOn(printable, 'on');
        result = printable.print(printer);
        result.emit('message', testPrinterMessage);
    });
    test('exists', () => {
        expect(printable).toHaveProperty('print', expect.any(Function));
    });
    test('is fluent', () => {
        expect(result).toBe(printable);
    });
    test('registers message handler to provided printer', () => {
        expect(printableSpy).toHaveBeenCalledWith('message', printer);
    });
    test('calls printer on message event', () => {
        expect(printer).toHaveBeenCalledWith(testPrinterMessage);
    });
});

describe('Printable.print default', () => {
    let printable;
    let printableSpy;
    let result;
    const testPrinterMessage = 'message ;po.lki,jmhngbfved';
    beforeAll(() => {
        printable = new Printable;
        printableSpy = jest.spyOn(printable, 'on');
        result = printable.print();
        result.emit('message', testPrinterMessage);
    });
    test('exists', () => {
        expect(printable).toHaveProperty('print', expect.any(Function));
    });
    test('is fluent', () => {
        expect(result).toBe(printable);
    });
    test('registers message handler to provided printer', () => {
        expect(printableSpy).toHaveBeenCalledWith('message', defaultPrinter);
    });
});
