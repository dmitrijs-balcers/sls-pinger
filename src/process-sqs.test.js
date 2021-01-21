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

  test('publishes a new SNS message if PINGER falls within defined bounds', async () => {
    const event = {
      Records: createMockRecords([createPropertyFixture()]),
    };
    db.query.mockReturnValue([
      createPingerFixture(),
      createPingerFixture({
        rooms_min: 4,
      }),
    ]);

    await run(event);

    expect(sns.publish).toBeCalledTimes(1);
    expect(db.query).toBeCalledTimes(1);
  });

  test.each(['daily', 'weekly', 'monthly'])(
    'writes a new queue entry if pinger invocation is %j',
    async (type) => {
      const event = {
        Records: createMockRecords([createPropertyFixture()]),
      };
      db.query.mockReturnValue([
        createPingerFixture({ type }),
        createPingerFixture({
          rooms_min: 4,
          type,
        }),
      ]);

      await run(event);

      expect(sns.publish).not.toBeCalled();
      expect(db.query).toBeCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('INSERT INTO pinger_queue'),
        }),
      );
    },
  );

  test('does not publish an SNS message if PINGER falls outside of defined bounds', async () => {
    const event = {
      Records: createMockRecords([createPropertyFixture({ lat: 59.9965 })]),
    };

    await run(event);

    expect(sns.publish).not.toBeCalled();
    expect(db.query).toBeCalledTimes(1);
  });
});
