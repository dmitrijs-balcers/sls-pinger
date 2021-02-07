import * as db from './shared/db';
import sns from './shared/sns';
import { run } from './process-sqs';
import { createPingerFixture, createPropertyFixture } from '__fixtures__';

jest.mock('./shared/db');
jest.mock('./shared/sns');

function createMockRecords(records) {
  return records.map((data) => ({
    body: JSON.stringify(data),
  }));
}

describe('process-sqs', () => {
  afterEach(jest.clearAllMocks);

  describe('publishes a new SNS message', () => {
    test('if PINGER falls within defined bounds', async () => {
      const event = {
        Records: createMockRecords([createPropertyFixture()]),
      };
      db.getAvailablePingers.mockReturnValue([
        createPingerFixture(),
        createPingerFixture({
          rooms_min: 4,
        }),
      ]);

      await run(event);

      expect(sns.publish).toBeCalledTimes(1);
      expect(db.getAvailablePingers).toBeCalledTimes(1);
    });

    test('if PINGER falls within defined total price range', async () => {
      const event = {
        Records: createMockRecords([
          createPropertyFixture({
            price: 10000,
            calc_price_per_sqm: 50,
          }),
        ]),
      };
      db.getAvailablePingers.mockReturnValue([
        createPingerFixture({
          price_min: 10000,
          price_max: 50000,
          price_type: 'total',
        }),
      ]);

      await run(event);

      expect(sns.publish).toBeCalledTimes(1);
      expect(db.getAvailablePingers).toBeCalledTimes(1);
    });

    test('if PINGER falls within defined sqm price range', async () => {
      const event = {
        Records: createMockRecords([
          createPropertyFixture({
            price: 10000,
            calc_price_per_sqm: 50,
          }),
        ]),
      };
      db.getAvailablePingers.mockReturnValue([
        createPingerFixture({
          price_min: 10,
          price_max: 100,
          price_type: 'sqm',
        }),
      ]);

      await run(event);

      expect(sns.publish).toBeCalledTimes(1);
      expect(db.getAvailablePingers).toBeCalledTimes(1);
    });
  });

  test.each(['daily', 'weekly', 'monthly'])(
    'writes a new queue entry if pinger invocation is %j',
    async (type) => {
      const event = {
        Records: createMockRecords([createPropertyFixture()]),
      };
      db.getAvailablePingers.mockReturnValue([
        createPingerFixture({ type }),
        createPingerFixture({
          rooms_min: 4,
          type,
        }),
      ]);

      await run(event);

      expect(sns.publish).not.toBeCalled();
      expect(db.queuePingerForSummaryEmail).toBeCalled();
    },
  );

  test('does not publish an SNS message if PINGER falls outside of defined bounds', async () => {
    const event = {
      Records: createMockRecords([createPropertyFixture({ lat: 59.9965 })]),
    };

    await run(event);

    expect(sns.publish).not.toBeCalled();
    expect(db.getAvailablePingers).toBeCalledTimes(1);
  });
});
