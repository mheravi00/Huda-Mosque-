import test from 'node:test';
import assert from 'node:assert/strict';
import { ageOn, matchClass } from '../server/families';

const classes = [
  { id: 'b1', name: 'Boys 6-8', gender: 'male', min_age: 6, max_age: 8 },
  { id: 'b2', name: 'Boys 9-11', gender: 'male', min_age: 9, max_age: 11 },
  { id: 'g1', name: 'Girls 6-8', gender: 'female', min_age: 6, max_age: 8 },
  { id: 'old', name: 'Old', gender: 'male', min_age: 6, max_age: 8, active: false },
];

test('ageOn counts whole years and respects the birthday', () => {
  const today = new Date('2026-09-24T12:00:00Z');
  assert.equal(ageOn('2018-09-24', today), 8);
  assert.equal(ageOn('2018-09-25', today), 7);
  assert.equal(ageOn('2017-10-01', today), 8);
});

test('matchClass picks the active class for gender and age bracket', () => {
  assert.equal(matchClass(classes, 'male', 8)?.id, 'b1');
  assert.equal(matchClass(classes, 'male', 9)?.id, 'b2');
  assert.equal(matchClass(classes, 'female', 7)?.id, 'g1');
  assert.equal(matchClass(classes, 'female', 10), null);
  assert.equal(matchClass(classes, 'male', 4), null);
});

test('matchClass uses the date-of-birth range when a class has one', () => {
  const split = [
    { id: 'b6', name: 'Boys 6-8', gender: 'male', min_age: 6, max_age: 8 },
    { id: 'b910', name: 'Boys 9-10', gender: 'male', min_age: 9, max_age: 10, dob_from: '2016-05-01', dob_to: '2017-10-06' },
    { id: 'b1011', name: 'Boys 10-11', gender: 'male', min_age: 10, max_age: 11, dob_from: '2014-10-08', dob_to: '2016-04-30' },
    { id: 'b12', name: 'Boys 12-14', gender: 'male', min_age: 12, max_age: 14 },
  ];
  const today = new Date('2026-10-07T12:00:00Z');
  const place = (dob: string) => matchClass(split, 'male', ageOn(dob, today), dob)?.id ?? null;
  assert.equal(place('2017-10-06'), 'b910');
  assert.equal(place('2016-05-01'), 'b910');
  assert.equal(place('2016-04-30'), 'b1011');
  assert.equal(place('2014-10-08'), 'b1011');
  assert.equal(place('2017-10-08'), 'b6');
  assert.equal(place('2014-10-07'), 'b12');
  assert.equal(matchClass(split, 'male', 10, null)?.id ?? null, null);
});
