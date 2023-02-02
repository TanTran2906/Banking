'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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


const displayMovements = function(movements, sort = false){
    //Xóa mặc định hiển thị ban đầu
    containerMovements.innerHTML = ''

    //Truyền vào true thì sort
    const movs = sort ? movements.slice().sort((a,b) => a - b) : movements
    
    movs.forEach(function(movement,i) {
        //Tiền gửi là dương, rút là âm
        const type = movement > 0 ? 'deposit' : 'withdrawal'

        const html = 
        `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
          <div class="movements__value">${movement}€</div>
        </div>
        `
        containerMovements.insertAdjacentHTML('afterbegin',html);

    });
}


//Display Balance
const calcDisplayBalance = function(acc){
  const balance_value = acc.movements.reduce((arr,cur) => arr + cur ,0)
  acc.balance = balance_value //Lưu balance vào tài khoản
  labelBalance.innerText = `${balance_value} EUR `
}


//Display total sumary
const calcDisplaySumary = function(account){
  const inSumary = account.movements.filter(movement => movement > 0)
  .reduce((acc, movement) => acc + movement,0)
  labelSumIn.innerText = `${inSumary} €`

  const outSumary = account.movements.filter(movement => movement < 0)
  .reduce((acc, movement) => acc + movement,0)
  labelSumOut.innerText = `${Math.abs(outSumary)} €`

  const interestTotal = account.movements.filter(movement => movement > 0)
  .map(movement => movement * account.interestRate/100)
  .filter(movement => movement >=1 )
  .reduce((acc, movement) => acc + movement,0)
  labelSumInterest.innerText = `${interestTotal} €`
}


//Tạo userName
const createUserName = function(accs){
  accs.forEach(function(acc){
    acc.userName = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
  })
}
createUserName(accounts)


//-----------------Login---------------------//
let currentAccount; //Người dùng hiện tại
btnLogin.addEventListener('click',function(e){
  e.preventDefault();
  
  currentAccount = accounts.find(account => account.userName === inputLoginUsername.value)
  console.log(currentAccount);

  if(currentAccount?.pin === Number(inputLoginPin.value)){
    //Display message
    labelWelcome.innerText = `Welcome back, ${currentAccount.owner.split(' ')[0]}`

    //Display UI
    containerApp.style.opacity = 1

    //Clear user,passwork and pointer
    inputLoginUsername.value = inputLoginPin.value = ''
    inputLoginPin.blur()

    //Display movement
    displayMovements(currentAccount.movements);

    //Display balance
    calcDisplayBalance(currentAccount)

    //Display sumary follow currentAccout vì lãi xuất mỗi tài khoản là khác nhau
    calcDisplaySumary(currentAccount)
  }
})

//-----------------Transfer money---------------------//

btnTransfer.addEventListener('click',function(e){
  e.preventDefault()
  const amount = Number(inputTransferAmount.value)
  const receiveMoney = accounts.find(acc => acc.userName === inputTransferTo.value)

  inputTransferTo.value = inputTransferAmount.value = ''
  inputTransferAmount.blur()

  if(amount > 0 && receiveMoney && currentAccount.balance >= amount 
    && receiveMoney?.userName !== currentAccount.userName){
      currentAccount.movements.push(-amount)
      receiveMoney.movements.push(amount)

    //Display movement
    displayMovements(currentAccount.movements);

    //Display balance
    calcDisplayBalance(currentAccount)

    //Display sumary follow currentAccout vì lãi xuất mỗi tài khoản là khác nhau
    calcDisplaySumary(currentAccount)
  }
})


//-----------------Close account---------------------//
btnClose.addEventListener('click',function(e){
  e.preventDefault()

  if(inputCloseUsername.value === currentAccount.userName && Number(inputClosePin.value)=== currentAccount.pin){
    const index = accounts.findIndex(acc => acc.userName === currentAccount.userName)
    accounts.splice(index,1)

    //Hide UI
    containerApp.style.opacity = 0
  }
})

//----------------------Loan------------------------//
btnLoan.addEventListener('click',function(e){
  e.preventDefault()

  const loanAmount = Number(inputLoanAmount.value)

  if(loanAmount > 0 && currentAccount.movements.some(mov => mov >= loanAmount * 0.1)){
    currentAccount.movements.push(loanAmount)

    //Display movement
    displayMovements(currentAccount.movements);

    //Display balance
    calcDisplayBalance(currentAccount)

    //Display sumary follow currentAccout vì lãi xuất mỗi tài khoản là khác nhau
    calcDisplaySumary(currentAccount)
  }
  inputLoanAmount.value = ''
  inputLoanAmount.blur()
})

//----------------------Sorted------------------------//
let sorted = false 
btnSort.addEventListener('click',function(e){
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted)
  sorted = !sorted

})


