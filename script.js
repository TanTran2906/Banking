'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
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


//Lịch sử thực hiện giao dịch
const calcDisplayDate = function(elementDate){
  const calcPassedDate = (date1,date2) => Math.round(Math.abs(date2 - date1) / (1000*60*60*24))
  const passedDate = calcPassedDate(elementDate,new Date(2020,7,1))
  console.log(passedDate);
  if(passedDate === 0) return 'Today'
  if(passedDate === 1) return 'Yesterday'
  if(passedDate <= 7) return `${passedDate} days ago`
  else{
    const year = elementDate.getFullYear()
    const month = elementDate.getMonth().toString().padStart(2,0)
    const date = elementDate.getDate().toString().padStart(2,0)
    const hours = elementDate.getHours()
    const minute = elementDate.getMinutes().toString().padStart(2,0)
    return `${date}/${month}/${year} ${hours}:${minute}`  
  }
  
}

const displayMovements = function(acc, sort = false){
    //Xóa mặc định hiển thị ban đầu
    containerMovements.innerHTML = ''
    
    //Truyền vào true thì sort
    const movs = sort ? acc.movements.slice().sort((a,b) => a - b) : acc.movements
    
    

    movs.forEach(function(movement,i) {
        //Tiền gửi là dương, rút là âm
        const type = movement > 0 ? 'deposit' : 'withdrawal'

        const elementDate = new Date(acc.movementsDates[i])
        const displayDate = calcDisplayDate(elementDate)

        const html = 
        `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
          <div class="movements__date">${displayDate}</div>
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
  labelSumIn.innerText = `${+(inSumary).toFixed(2)} €`

  const outSumary = account.movements.filter(movement => movement < 0)
  .reduce((acc, movement) => acc + movement,0)
  labelSumOut.innerText = `${Math.abs(outSumary).toFixed(2)} €`

  const interestTotal = account.movements.filter(movement => movement > 0)
  .map(movement => movement * account.interestRate/100)
  .filter(movement => movement >=1 )
  .reduce((acc, movement) => acc + movement,0)
  labelSumInterest.innerText = `${+(interestTotal).toFixed(2)} €`
}


//Tạo userName
const createUserName = function(accs){
  accs.forEach(function(acc){
    acc.userName = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
  })
}
createUserName(accounts)

const updateAccount = function(currentAccount){
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount)
  calcDisplaySumary(currentAccount)
}

//-----------------Login---------------------//
let currentAccount, Timer; //Người dùng hiện tại, đồng hồ bấm giờ cho người dùng hiện tại

//==FAKE LOGIN
// currentAccount = account1;
// updateAccount(currentAccount)
// containerApp.style.opacity = 1

//Đồng hồ đếm thời gian
const startTimer = function(){
  let totalSeconds = 90
  const Timer = function(){
    
    let minutes = String(Math.floor(totalSeconds / 60)).padStart(2,0)
    let seconds = String(totalSeconds % 60).padStart(2,0)
    labelTimer.innerText = `${minutes}:${seconds}`
    if(totalSeconds === 0){
      containerApp.style.opacity = 0
      labelWelcome.innerText = `Log in to get started`
      clearInterval(Timer)
    }

    totalSeconds--;
  }
  //Cho đồng hồ đếm giờ chạy ngay lập tức
  Timer()
  const timer = setInterval(Timer,1000)
  return timer;
}


//Login
btnLogin.addEventListener('click',function(e){
  e.preventDefault();
  
  currentAccount = accounts.find(account => account.userName === inputLoginUsername.value)

  if(currentAccount?.pin === Number(inputLoginPin.value)){
    //Display message
    labelWelcome.innerText = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
    const nowDate = new Date()
    const year = nowDate.getFullYear()
    const month = nowDate.getMonth().toString().padStart(2,0)
    const date = nowDate.getDate().toString().padStart(2,0)
    const hours = nowDate.getHours()
    const minute = nowDate.getMinutes().toString().padStart(2,0)
    const currentDate = `${date}/${month}/${year} ${hours}:${minute}`
    labelDate.innerText = currentDate
    //Display UI
    containerApp.style.opacity = 1

    //Clear user,passwork and pointer
    inputLoginUsername.value = inputLoginPin.value = ''
    inputLoginPin.blur()

    //Display movement
    displayMovements(currentAccount);

    //Display balance
    calcDisplayBalance(currentAccount)

    //Display sumary follow currentAccout vì lãi xuất mỗi tài khoản là khác nhau
    calcDisplaySumary(currentAccount)

    //Làm gì đó giữa chừng
    if(Timer) clearInterval(Timer)
    Timer = startTimer()
    
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

      currentAccount.movementsDates.push(new Date())
      receiveMoney.movementsDates.push(new Date())

    //Display movement
    displayMovements(currentAccount);

    //Display balance
    calcDisplayBalance(currentAccount)

    //Display sumary follow currentAccout vì lãi xuất mỗi tài khoản là khác nhau
    calcDisplaySumary(currentAccount)
  }

  if(Timer) clearInterval(Timer)
    Timer = startTimer()
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
    

    setTimeout(function(){
      currentAccount.movements.push(loanAmount)
      currentAccount.movementsDates.push(new Date())
      //Display movement
      displayMovements(currentAccount);

      //Display balance
      calcDisplayBalance(currentAccount)

      //Display sumary follow currentAccout vì lãi xuất mỗi tài khoản là khác nhau
      calcDisplaySumary(currentAccount)
    },3000)
    
  }
  inputLoanAmount.value = ''
  inputLoanAmount.blur()

  if(Timer) clearInterval(Timer)
    Timer = startTimer()
})

//----------------------Sorted------------------------//
let sorted = false 
btnSort.addEventListener('click',function(e){
  e.preventDefault();
  displayMovements(currentAccount, !sorted)
  sorted = !sorted

})


