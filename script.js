'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}???</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}???`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}???`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}???`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}???`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

console.log(23 === 23.0);

// Base 10 - 0 to 9. 1/10 = 0.1. 3/10 = 3.33333333
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log(Number(23));
console.log(typeof +'23');

// Parsing
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e23', 10));

console.log(parseFloat('    23.234rem    '));
// console.log(Number.parseFloat(' 23.234rem')); encourage to do this way

// check if value is not a number
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'234K'));
console.log(Number.isNaN(23 / 0));

// best way if value is number
console.log(Number.isFinite(20));
console.log(Number.isFinite(20 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));

console.log(Math.sqrt(25));
console.log(25 ** 0.5);
// square root
console.log(25 ** (1 / 2));
// cubic root
console.log(8 ** (1 / 3));

// Maximum number
// it does type coersion but not parsing
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));

console.log(Math.min(5, 18, 23, 11, 2));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max-min) -> min...max
console.log(randomInt(10, 20));

// Rounding  Integers
console.log(Math.trunc(23.3));

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

// Rounding decimals
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.7).toFixed(2));

// The Reminder operator (%)
console.log(5 % 2);

// The Numeric Separator
// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const priceCents = 435_99;
console.log(priceCents);

// working with BigInt
const huge = 200349257495239539753487583475437n;
const num = 23;
console.log(huge);
console.log(huge * BigInt(num));

// Exceptions
console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n === '20');

// Divisions
console.log(11n / 3n);
console.log(10 / 3);

// Revise
console.log(23 === 23.0, 'revise');

// Base 10 - 0 to 9 = 0.1. 3/10 = 3.3333333
console.log(0.1 + 0.2, 'revise');
console.log(0.1 + 0.2 === 0.3, 'revise');

// conversion
console.log(Number('23'), 'revise');
console.log(+'23', 'revise');

// parsing
console.log(Number.parseInt('30px'), 'revise');
console.log(Number.parseInt('e30'), 'revise');

console.log(Number.parseInt('  2.5rem  '), 'revise');
console.log(Number.parseFloat('  2.5rem  '), 'revise');

//  isNan
console.log(Number.isNaN(+'23.4eb '), 'revise');

// Checking if value is a number
console.log(Number.isFinite(20 / 0), 'revise');

// Math Namespace
console.log(Math.sqrt(25), 'revise');
// Cubic root might be only way
console.log(8 ** (1 / 3), 'revise');

console.log(Math.max(5, 18, 23, 11, 2), 'revise');
console.log(Math.max(5, 18, '23', 11, 2), 'revise');
console.log(Math.max(5, 18, '23p', 11, 2), 'revise');

console.log(Math.min(5, 18, 23, 11, 2), 'revise');

console.log(Math.PI * Number.parseFloat('10px') ** 2, 'revise');

//  Math and Rounding
console.log(Math.trunc(Math.random() * 6 + 1), 'revise');

//  Random integer b/w given 2 number
const randomInteger = (min, max) => {
  // 0...1 -> 0...(max - min) -> min...max
  return Math.trunc(Math.random() * (max - min) + 1) + min;
};
console.log(randomInteger(10, 20), 'revise');

// Rounding Integers
console.log(Math.trunc(23.3), 'revise');

console.log(Math.round(23.3), 'revise');
console.log(Math.round(23.9), 'revise');

console.log(Math.ceil(23.3), 'revise');
console.log(Math.ceil(23.9), 'revise');

console.log(Math.floor(23.3), 'revise');
console.log(Math.floor(23.9), 'revise');

// Rounding Decimals
console.log((2.7).toFixed(0), 'revise');

// The Reminder Operator
console.log(5 % 2, 'revise');
console.log(5 / 2, 'revise'); // 5 = 2 * 2 + 1
console.log(8 % 3, 'revise');
console.log(8 / 3, 'revise'); // 8 = 2 * 3 + 2

// Even and Odd Number
console.log(6 % 2, 'revise');
console.log(6 / 2, 'revise');

console.log(7 % 2, 'revise');
console.log(7 / 2, 'revise');

const isEven = num => num % 2 === 0;
console.log(isEven(8), 'revise');
console.log(isEven(23), 'revise');
console.log(isEven(514), 'revise');

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
// Nth

// Numeric Separator
const diameterR = 287_460_000_000;
console.log(diameterR, 'revise');

const priceInCents = 345_99;
console.log(priceInCents, 'revise');

const transferFeeR1 = 15_00;
const transferFeeR2 = 1_500;

const PI = 3.14_15;
console.log(PI, 'revise');

// BigInt
console.log(2 ** 53 - 1, 'revise');
console.log(Number.MAX_SAFE_INTEGER, 'revise');
console.log(2 ** 53 + 1, 'revise');
console.log(2 ** 53 + 2, 'revise');
console.log(2 ** 53 + 3, 'revise');
console.log(2 ** 53 + 4, 'revise');

console.log(2345342543543534253453535342523454354235n, 'revise');

console.log(BigInt(2345342543543534253453535342523454354235), 'revise');

// Create a Date and Time
const now = new Date();
console.log(now);

console.log(new Date('Thu Mar 09 2023 00:54:56'));

console.log(new Date('December 24,2015'));
console.log(new Date('2019-11-01T13:15:33.035Z'));

console.log(new Date(2037, 10, 50));
console.log(0);
console.log(3 * 24 * 60 * 60 * 1000);

// working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future.getFullYear(), 'dates');
console.log(future.getMonth(), 'dates');
console.log(future.getDate(), 'dates');
console.log(future.getDay(), 'dates');
console.log(future.toISOString(), 'dates');
console.log(future.getTime(), 'dates');
console.log(new Date(2142238980000), 'dates');
console.log(Date.now(), 'dates');

// operation with dates
const futureTime = new Date(2037, 10, 19, 15, 23);
console.log(+futureTime);

const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1);

const days1 = calcDaysPassed(new Date(2037, 10, 19), new Date(2037, 10, 4));

console.log(days1 / (1000 * 60 * 60 * 24));

// Experimenting   with API
const locale = navigator.locale;

console.log(locale);

const n = 283741234.23;
// console.log(n.Intl.NumberFormat('en-US').format(num));
console.log('en-US', new Intl.NumberFormat('en-US').format(n));

console.log('Germany:', new Intl.NumberFormat('de-DE').format(n));

// Timers

// setTimeout
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (arg1, arg2) => console.log(`Here is your Pizza ${arg1} and ${arg2} `),
  3000,
  ...ingredients
);
console.log(...ingredients);

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval
setInterval(() => {
  const now = new Date();
  let time = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  console.log(time);
}, 1000);
