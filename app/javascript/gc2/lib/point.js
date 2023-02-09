import { Message } from '../../mastodon/features/livechat/components/firebaseapp';

export const PointTable = [
  { point:   100, time:     0, size:   0 },
  { point:   200, time:     0, size:  50 },
  { point:   500, time:   120, size: 150 },
  { point:  1000, time:   300, size: 200 },
  { point:  2000, time:   600, size: 225 },
  { point:  5000, time:  1800, size: 250 },
  { point: 10000, time:  3600, size: 270 },
  { point: 20000, time:  7200, size: 290 },
  { point: 30000, time: 10800, size: 310 },
  { point: 40000, time: 14400, size: 330 },
  { point: 50000, time: 18000, size: 350 },
];

export const get = (index) => PointTable[index];

export const length = PointTable.length;

export const toColorIndex = (value) => {
  if (typeof value !== 'number' || value <= 0) return 0;
  for (let i = 0, n = PointTable.length; i < n; i += 1) {
    if (value < PointTable[i].point) return i;
  }
  return PointTable.length;
};

export const toTime = (value) => {
  if (typeof value !== 'number' || value <= 0) return 0;
  for (let i = 1, n = PointTable.length; i < n; i += 1) {
    if (value < PointTable[i].point) return PointTable[i - 1].time;
  }
  return PointTable[PointTable.length - 1].time;
};

/**
 * @param {Message} param0
 * @returns {number}
 */
export const toExpiredAt = ({ created_at, point }) => {
  if (isNaN(point) || point <= 0) return 0;
  const time = toTime(point) * 1000;
  return created_at + time;
};

/**
 * @param {Message} param0
 * @returns {boolean}
 */
export const isSpecial = message => Date.now() < toExpiredAt(message);

export default {
  get,
  length,
  toColorIndex,
  toTime,
  toExpiredAt,
  isSpecial,
};
