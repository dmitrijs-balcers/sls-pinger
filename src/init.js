'use strict';

require('dotenv').config();

const AWS = require('aws-sdk');
const Q = require('q');
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

AWS.config.update({ region: process.env.AWS_REGION });

module.exports.run = (event, context, callback) => {

  const pingers = [{
    id: 2, // Zanis
    query: `
      SELECT * 
      FROM properties 
      WHERE created_at > ? 
        AND category = "apartment"
        AND type = "rent"
        AND (rent_type IS NULL OR rent_type = "monthly")
        AND price >= 200 AND price <= 300
        AND floor >= 2 AND floor <= 3
        AND ST_Contains(ST_GeomFromText('POLYGON((56.95714 24.11499, 56.95658 24.11619, 56.9563 24.11671, 56.95593 24.11722, 56.95555 24.11808, 56.95537 24.11842, 56.95527 24.11877, 56.95509 24.11911, 56.95499 24.11945, 56.9548 24.1198, 56.95471 24.12014, 56.95452 24.12014, 56.95443 24.12048, 56.95434 24.12083, 56.95424 24.12117, 56.95424 24.12151, 56.95415 24.12186, 56.95406 24.1222, 56.95396 24.12254, 56.95387 24.12289, 56.95368 24.12289, 56.95359 24.12323, 56.9534 24.1234, 56.95321 24.12374, 56.95303 24.12409, 56.95284 24.12443, 56.95265 24.1246, 56.95256 24.12495, 56.95237 24.12512, 56.95218 24.12546, 56.95209 24.1258, 56.9519 24.12598, 56.95181 24.12632, 56.95181 24.12666, 56.9519 24.12701, 56.9519 24.12735, 56.95172 24.12786, 56.95153 24.12821, 56.95134 24.12855, 56.95115 24.12889, 56.95097 24.12924, 56.95078 24.12958, 56.95059 24.12992, 56.9504 24.1301, 56.95012 24.13044, 56.94994 24.13061, 56.94975 24.13095, 56.94956 24.1313, 56.94937 24.13181, 56.94928 24.13216, 56.94909 24.13267, 56.94891 24.13301, 56.94863 24.13353, 56.94844 24.13404, 56.94825 24.13456, 56.94797 24.13507, 56.94797 24.13542, 56.94788 24.13576, 56.94769 24.13645, 56.9476 24.13696, 56.9475 24.13748, 56.94741 24.13799, 56.94722 24.13868, 56.94713 24.13954, 56.94713 24.14005, 56.94713 24.14057, 56.94703 24.14091, 56.94703 24.14143, 56.94703 24.14194, 56.94703 24.14228, 56.94703 24.14263, 56.94703 24.14297, 56.94713 24.14331, 56.94713 24.14383, 56.94713 24.14434, 56.94722 24.14503, 56.94731 24.14537, 56.94731 24.14589, 56.94741 24.14623, 56.94741 24.14675, 56.9475 24.14709, 56.9475 24.14743, 56.9475 24.14778, 56.9476 24.14812, 56.94778 24.14846, 56.94788 24.14881, 56.94825 24.14915, 56.94844 24.14949, 56.94872 24.14984, 56.94891 24.15018, 56.949 24.15052, 56.949 24.15087, 56.94928 24.15087, 56.94984 24.15121, 56.95022 24.15138, 56.95059 24.15138, 56.95087 24.15155, 56.95115 24.15155, 56.95153 24.15155, 56.95181 24.15155, 56.95209 24.15155, 56.95256 24.15138, 56.95284 24.15138, 56.95312 24.15121, 56.95349 24.15104, 56.95443 24.15087, 56.95499 24.15087, 56.95537 24.1507, 56.95583 24.1507, 56.95621 24.1507, 56.95649 24.1507, 56.95677 24.1507, 56.95714 24.1507, 56.95743 24.1507, 56.9578 24.1507, 56.95817 24.1507, 56.95864 24.1507, 56.95902 24.1507, 56.9593 24.15087, 56.95958 24.15104, 56.95986 24.15121, 56.96033 24.15121, 56.96061 24.15121, 56.96089 24.15138, 56.96117 24.15155, 56.96145 24.15155, 56.96173 24.15155, 56.96201 24.15155, 56.96229 24.15138, 56.96257 24.15138, 56.96295 24.15087, 56.96323 24.15035, 56.96342 24.14984, 56.9636 24.14932, 56.96379 24.14881, 56.96398 24.14829, 56.96416 24.14778, 56.96435 24.14692, 56.96435 24.14589, 56.96444 24.14503, 56.96454 24.14434, 56.96473 24.14383, 56.96473 24.14297, 56.96491 24.14246, 56.9651 24.14194, 56.96538 24.14143, 56.96566 24.14108, 56.96575 24.14057, 56.96585 24.13954, 56.96604 24.13885, 56.96613 24.13834, 56.96641 24.13765, 56.9666 24.13713, 56.96688 24.13662, 56.96706 24.1361, 56.96725 24.13559, 56.96763 24.13507, 56.96781 24.13456, 56.96809 24.13422, 56.96837 24.13422, 56.96866 24.13422, 56.96894 24.13404, 56.96922 24.13387, 56.9695 24.13353, 56.96978 24.13319, 56.97006 24.13284, 56.97034 24.1325, 56.97071 24.13233, 56.97099 24.13216, 56.97128 24.13181, 56.97156 24.13147, 56.97184 24.13113, 56.97212 24.13078, 56.97249 24.13044, 56.97268 24.12992, 56.97277 24.12941, 56.97287 24.12872, 56.97287 24.12821, 56.97296 24.12752, 56.97296 24.12701, 56.97296 24.12632, 56.97296 24.12563, 56.97296 24.12512, 56.97287 24.1246, 56.97249 24.12392, 56.9723 24.1234, 56.97184 24.12271, 56.97165 24.1222, 56.97118 24.12151, 56.97034 24.12066, 56.96968 24.11997, 56.96856 24.11911, 56.96819 24.11842, 56.96791 24.11791, 56.96735 24.11722, 56.96697 24.11671, 56.9666 24.11619, 56.96641 24.11568, 56.96566 24.11516, 56.96463 24.11465, 56.96435 24.1143, 56.96407 24.11396, 56.96379 24.11362, 56.96351 24.11327, 56.96323 24.11293, 56.96276 24.11259, 56.96239 24.11224, 56.9621 24.1119, 56.96182 24.11173, 56.96154 24.11156, 56.96126 24.11139, 56.96098 24.11121, 56.9607 24.11104, 56.96033 24.11104, 56.96005 24.11104, 56.95939 24.11156, 56.95799 24.11327, 56.95733 24.11448, 56.95724 24.11551, 56.95724 24.11585, 56.95724 24.11619, 56.95714 24.11654, 56.95714 24.11688, 56.95714 24.11722, 56.95714 24.11499))'), point(lat, lng))
      ORDER BY created_at
    `,
  }, {
    id: 4, // Andris
    query: `
      SELECT * 
      FROM properties 
      WHERE created_at > ? 
        AND category = "garage"
        AND type = "sell"
        AND price >= 10000
        AND ST_Contains(ST_GeomFromText('POLYGON((57.00747 24.05457, 56.9856 24.0015, 56.95791 23.9916, 56.9431 23.98727, 56.92549 23.98384, 56.91612 24.00169, 56.90338 24.05937, 56.89625 24.09714, 56.897 24.12872, 56.90563 24.15688, 56.91388 24.17816, 56.92774 24.20563, 56.94643 24.22755, 56.9622 24.23447, 56.98504 24.21554, 57.00583 24.15522, 57.00747 24.05457))'), point(lat, lng))
      ORDER BY created_at
    `,
  }, {
    id: 5, // 1. Pingeris
    query: `
      SELECT * 
      FROM properties 
      WHERE created_at > ? 
        AND category = "apartment"
        AND type = "sell"
        AND floor >= 2
        AND rooms = 3
        AND area >= 60 AND area <= 70
        AND price >= 40000 AND price <= 70000
        AND ST_Contains(ST_GeomFromText('POLYGON((56.98886 24.24253, 56.97923 24.25558, 56.96482 24.2561, 56.95452 24.24494, 56.95852 24.22942, 56.95546 24.19189, 56.94311 24.17663, 56.93365 24.1406, 56.92043 24.081, 56.9365 24.04642, 56.9476 24.04169, 56.96056 24.04032, 56.97764 24.14675, 56.98886 24.24253))'), point(lat, lng))
      ORDER BY created_at
    `,
  }, {
    id: 6, // 2. Pingeris
    query: `
      SELECT * 
      FROM properties 
      WHERE created_at > ? 
        AND category = "apartment"
        AND type = "sell"
        AND floor >= 2
        AND rooms >= 1 AND rooms <= 2
        AND area >= 25
        AND area <= 35
        AND price >= 40000 AND price <= 70000
        AND ST_Contains(ST_GeomFromText('POLYGON((56.96388 24.07499, 56.95499 24.07499, 56.95087 24.07671, 56.94694 24.08134, 56.9416 24.08684, 56.93261 24.09044, 56.92259 24.07413, 56.92389 24.05964, 56.93018 24.04993, 56.93861 24.04478, 56.94923 24.04136, 56.95321 24.04015, 56.95972 24.03998, 56.96331 24.04373, 56.969 24.04614, 56.9738 24.04924, 56.97689 24.05714, 56.97642 24.06641, 56.97221 24.07207, 56.96987 24.07671, 56.96285 24.07585, 56.96388 24.07499))'), point(lat, lng))
      ORDER BY created_at
    `,
  }, {
    id: 7, // 4. pingeris
    query: `
      SELECT * 
      FROM properties 
      WHERE created_at > ?
        AND type = "sell"
        AND (
          ST_Contains(ST_GeomFromText('POLYGON((57.02613 23.49772, 57.02576 23.49584, 57.01716 23.50378, 57.00883 23.51414, 57.00856 23.51586, 57.02229 23.50329, 57.02613 23.49772))'), point(lat, lng))
          OR ST_Contains(ST_GeomFromText('POLYGON((57.00868 23.51499, 56.98634 23.54409, 56.97665 23.56234, 56.97335 23.59915, 56.96484 23.6258, 56.96927 23.74224, 56.97655 23.79148, 56.98936 23.85963, 56.99877 23.90037, 57.00716 23.92643, 57.0074 23.92735, 57.01659 23.94902, 57.03297 23.98875, 57.04427 24.00302, 57.06217 24.02159, 57.07063 24.04443, 57.09162 24.13279, 57.10724 24.17259, 57.12882 24.2176, 57.14223 24.23873, 57.16024 24.26156, 57.17112 24.28946, 57.21498 24.36572, 57.23135 24.38427, 57.24282 24.39551, 57.26907 24.40996, 57.30005 24.4047, 57.3048 24.40473, 57.30473 24.40922, 57.28864 24.41237, 57.2776 24.41524, 57.26701 24.4128, 57.25883 24.40933, 57.25121 24.40466, 57.23712 24.39455, 57.23368 24.39123, 57.22365 24.38565, 57.1955 24.34362, 57.169 24.29409, 57.15477 24.28826, 57.14092 24.24199, 57.12731 24.22003, 57.10633 24.17713, 57.09068 24.13703, 57.07651 24.09235, 57.07296 24.07822, 57.06978 24.06306, 57.06604 24.03671, 57.06062 24.02418, 57.04954 24.0139, 57.03773 23.9985, 57.02852 23.98388, 57.02391 23.97588, 57.01666 23.95666, 57.00501 23.93801, 57.00204 23.91497, 56.99105 23.87988, 56.98101 23.82799, 56.97541 23.7931, 56.9716 23.77061, 56.96848 23.74768, 56.96636 23.73204, 56.96461 23.71597, 56.96252 23.68222, 56.96181 23.6564, 56.96225 23.64234, 56.96342 23.6308, 56.96485 23.6193, 56.96762 23.6092, 56.97213 23.59795, 56.97453 23.56619, 56.97792 23.55493, 56.99054 23.53093, 56.99151 23.52617, 56.99426 23.52416, 56.9994 23.51964, 57.00489 23.51651, 57.00678 23.51507, 57.00868 23.51499))'), point(lat, lng))
        )
      ORDER BY created_at
    `,
  }, {
    id: 8, // 5. pingeris
    query: `
      SELECT * 
      FROM properties 
      WHERE created_at > ?
        AND type = "sell"
        AND (
          ST_Contains(ST_GeomFromText('POLYGON((56.69093 23.79364, 56.68548 23.79178, 56.68226 23.80394, 56.68972 23.81005, 56.69269 23.80091, 56.69093 23.79364))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.65207 23.81845, 56.64226 23.82282, 56.63929 23.82377, 56.64103 23.83355, 56.64918 23.83972, 56.65304 23.83922, 56.65415 23.82174, 56.65394 23.81728, 56.65217 23.81604, 56.64703 23.81922, 56.64665 23.82016, 56.65207 23.81845))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.60127 23.69373, 56.59503 23.69236, 56.58331 23.67794, 56.58478 23.67128, 56.59485 23.67451, 56.6035 23.68168, 56.60562 23.69133, 56.60127 23.69373))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.6483 23.81166, 56.63688 23.80274, 56.64047 23.78523, 56.64862 23.78284, 56.65395 23.78865, 56.6483 23.81166))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.67019 23.8266, 56.66415 23.82351, 56.66601 23.80963, 56.67094 23.80669, 56.67584 23.81492, 56.67496 23.82784, 56.67019 23.8266))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.69376 23.83862, 56.68905 23.83381, 56.68 23.85029, 56.68132 23.86093, 56.68691 23.86331, 56.69301 23.85132, 56.69376 23.83862))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.70055 23.7315, 56.69565 23.73356, 56.69691 23.74341, 56.70043 23.74052, 56.70055 23.7315))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.63405 23.80197, 56.62862 23.7903, 56.62626 23.78643, 56.63018 23.77794, 56.63636 23.78695, 56.63695 23.79678, 56.63405 23.80197))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.63678 23.77579, 56.63254 23.77201, 56.63235 23.76677, 56.63486 23.75889, 56.63858 23.76549, 56.63981 23.77115, 56.63678 23.77579))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.69904 23.66867, 56.68367 23.69495, 56.67604 23.70644, 56.65377 23.71811, 56.6415 23.74077, 56.63924 23.75553, 56.64509 23.77922, 56.63301 23.80394, 56.63678 23.8139, 56.63133 23.83921, 56.63574 23.85172, 56.65157 23.77695, 56.64929 23.74887, 56.68615 23.7134, 56.69904 23.66867))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.67009 23.6618, 56.66726 23.66198, 56.66764 23.67262, 56.67 23.67176, 56.67009 23.6618))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.64589 23.68369, 56.64438 23.68403, 56.64283 23.68481, 56.64273 23.68858, 56.64473 23.68791, 56.64695 23.68663, 56.64589 23.68369))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.66321 23.70781, 56.66085 23.70875, 56.66156 23.71296, 56.66387 23.71159, 56.66335 23.70613, 56.66047 23.70772, 56.66047 23.70841, 56.66321 23.70781))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.65873 23.7551, 56.65736 23.75733, 56.65637 23.76102, 56.65818 23.76441, 56.66025 23.75556, 56.65873 23.7551))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.62848 23.69133, 56.62796 23.68738, 56.62909 23.68549, 56.63164 23.68403, 56.63173 23.68867, 56.63494 23.68858, 56.63576 23.68662, 56.6366 23.68752, 56.63815 23.68498, 56.64229 23.68117, 56.64178 23.67579, 56.644 23.67828, 56.64452 23.66837, 56.62848 23.69133))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.64254 23.68335, 56.64509 23.66065, 56.64684 23.65554, 56.64914 23.65271, 56.64849 23.64687, 56.649 23.644, 56.64915 23.64095, 56.65068 23.63858, 56.65318 23.63651, 56.66154 23.63083, 56.66549 23.62681, 56.66863 23.62919, 56.6725 23.62661, 56.67401 23.62335, 56.67509 23.62618, 56.66811 23.63657, 56.66205 23.63622, 56.64721 23.66178, 56.64528 23.68167, 56.64254 23.68335))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.63778 23.74703, 56.6356 23.74755, 56.63669 23.75072, 56.63822 23.75013, 56.63863 23.74738, 56.63778 23.74703))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.62229 23.77733, 56.62215 23.77411, 56.6246 23.77338, 56.626 23.77381, 56.62682 23.77587, 56.62785 23.77647, 56.62903 23.77698, 56.63328 23.77973, 56.63529 23.77813, 56.63728 23.77599, 56.6408 23.76506, 56.64202 23.76961, 56.63853 23.77974, 56.63669 23.78368, 56.6263 23.78016, 56.62229 23.77733))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.64032 23.74446, 56.63343 23.73347, 56.62994 23.73021, 56.62654 23.73133, 56.62357 23.72764, 56.61712 23.72561, 56.61724 23.72193, 56.62566 23.72401, 56.63247 23.72814, 56.63484 23.73115, 56.6407 23.74077, 56.64032 23.74446))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.68745 23.71141, 56.6891 23.71785, 56.68994 23.72257, 56.69296 23.72703, 56.69993 23.746, 56.70337 23.75905, 56.70441 23.7769, 56.70361 23.78729, 56.69776 23.75642, 56.69564 23.75181, 56.68692 23.72084, 56.68745 23.71141))'), point(lat, lng))
        OR ST_Contains(ST_GeomFromText('POLYGON((56.69499 23.79905, 56.69631 23.79484, 56.69433 23.79132, 56.69178 23.79398, 56.69298 23.80354, 56.69499 23.79905))'), point(lat, lng))
        )
      ORDER BY created_at
    `,
  }, {
    id: 9, // 6. pingeris
    query: `
      SELECT * 
      FROM properties 
      WHERE created_at > ? 
        AND category = "apartment"
        AND type = "rent"
        AND (rent_type IS NULL OR rent_type = "monthly")
        AND price <= 700
        AND rooms = 4
        AND ST_Contains(ST_GeomFromText('POLYGON((56.95771 24.09787, 56.95581 24.09645, 56.95019 24.10006, 56.94602 24.10394, 56.94363 24.11091, 56.95547 24.13066, 56.95776 24.12587, 56.96241 24.11633, 56.96268 24.10593, 56.96207 24.0981, 56.95771 24.09787))'), point(lat, lng))
      ORDER BY created_at
    `,
  }];

  // Invoke all
  Q.all(pingers.map(pinger => {
    const deferred = Q.defer();

    sns.publish({
      Message: 'ping',
      MessageAttributes: {
        query: {
          DataType: 'String',
          StringValue: pinger.query,
        },
        id: {
          DataType: 'String',
          StringValue: '' + pinger.id,
        },
      },
      MessageStructure: 'string',
      TargetArn: 'arn:aws:sns:eu-west-1:173751334418:pinger'
    }, (error, data) => {
      if (error) {
        deferred.reject(error);
        return;
      }

      deferred.resolve();
    });

    return deferred.promise;
  }))

  // Success
  .then(matches => {
    callback(null, `Invoked ${matches.length} item-crawlers.`);
  })

  // Error
  .catch(reason => {
    callback(reason);
  });
};
