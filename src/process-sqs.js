import numeral from 'numeral';
import inside from 'point-in-polygon';
import * as db from './shared/db';
import sns from './shared/sns';
import createUnsubscribeLink from './shared/unsubscribe-link';

function parseLocation(location) {
  return location
    .split(', ')
    .map((row) => row.split(' ').map((row) => parseFloat(row)))
    .slice(0, -1);
}

function nl2br(str, is_xhtml) {
  const breakTag =
    is_xhtml || typeof is_xhtml === 'undefined' ? '<br />' : '<br>';
  return (str + '').replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    '$1' + breakTag + '$2',
  );
}

function parseImages(img) {
  if (!img) {
    return [];
  }

  if (img instanceof Array) {
    return img;
  }

  return JSON.parse(img);
}

export async function run(event, context) {
  const properties = event.Records.map((row) => JSON.parse(row.body)).filter(
    (property) =>
      property.lat &&
      property.lng &&
      property.price > 0 &&
      ['sell', 'rent'].includes(property.type),
  );

  if (properties.length === 0) {
    return;
  }

  const results = await db.getAvailablePingers();

  const invocations = properties.map((property) => {
    const pingers = results
      .filter((pinger) => pinger.categories.includes(property.category))
      .filter((pinger) => pinger.types.includes(property.type))
      .filter(
        (pinger) =>
          pinger.price_min === null ||
          (pinger.price_type === 'sqm'
            ? property.calc_price_per_sqm >= pinger.price_min
            : property.price >= pinger.price_min),
      )
      .filter(
        (pinger) =>
          pinger.price_max === null ||
          (pinger.price_type === 'sqm'
            ? property.calc_price_per_sqm <= pinger.price_max
            : property.price <= pinger.price_max),
      )
      .filter(
        (pinger) =>
          pinger.rooms_min === null || property.rooms >= pinger.rooms_min,
      )
      .filter(
        (pinger) =>
          pinger.rooms_max === null || property.rooms <= pinger.rooms_max,
      )
      .filter(
        (pinger) =>
          pinger.area_m2_min === null || property.area >= pinger.area_m2_min,
      )
      .filter(
        (pinger) =>
          pinger.area_m2_max === null || property.area <= pinger.area_m2_max,
      )
      .filter(
        (pinger) =>
          pinger.floor_min === null || property.floor >= pinger.floor_min,
      )
      .filter(
        (pinger) =>
          pinger.floor_max === null || property.floor <= pinger.floor_max,
      )
      .filter((pinger) =>
        inside([property.lat, property.lng], parseLocation(pinger.location)),
      );

    return pingers.map((pinger) => ({ ...pinger, property }));
  });

  // Flatten the data
  const availableInvocations = [].concat.apply([], invocations);

  await Promise.all(
    availableInvocations
      .map((pinger) => {
        const result = pinger.property;
        result.images = parseImages(result.images);
        result.content = nl2br(
          (result.content || '').replace(/(<([^>]+)>)/gi, ''),
        );

        result.unsubscribe_url = createUnsubscribeLink(pinger);
        result.url = `https://view.brokalys.com/?link=${encodeURIComponent(
          result.url,
        )}`;
        result.price = numeral(result.price).format('0,0 €');
        result.is_premium = !!pinger.is_premium;

        return {
          to: pinger.email,
          pinger_id: pinger.id,
          template_id: 'email',
          template_variables: result,
          type: pinger.type,
        };
      })
      .map(performAction),
  );
}

function performAction(data) {
  if (data.type === 'immediate') {
    return publishSns(data);
  }

  return queuePinger(data);
}

function publishSns(data) {
  return sns
    .publish({
      Message: 'email',
      MessageAttributes: {
        to: {
          DataType: 'String',
          StringValue: data.to,
        },
        subject: {
          DataType: 'String',
          StringValue: 'Jauns PINGER sludinājums',
        },
        pinger_id: {
          DataType: 'Number',
          StringValue: String(data.pinger_id),
        },
        template_id: {
          DataType: 'String',
          StringValue: data.template_id,
        },
        template_variables: {
          DataType: 'String',
          StringValue: JSON.stringify(data.template_variables),
        },
      },
      MessageStructure: 'string',
      TargetArn: `arn:aws:sns:${process.env.AWS_REGION}:173751334418:email-${process.env.STAGE}`,
    })
    .promise();
}

function queuePinger(data) {
  return db.queuePingerForSummaryEmail(data.pinger_id, data.template_variables);
}
