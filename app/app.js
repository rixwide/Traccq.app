   // Import necessary Firebase modules
   //import database and auth packages
    import { db, auth } from "./firebase.js";
    //import from firestore packages
        import {
            collection,
            addDoc,
            query,
            orderBy,
            onSnapshot
        } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
        //import from authentication packages
        import {
            signInWithEmailAndPassword,
            createUserWithEmailAndPassword,
            signOut,
            onAuthStateChanged
        } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";



class runApp{

    constructor(){
        this.sideMenu = document.querySelectorAll('.main-nav li, .footer-nav li');
        this.menuContents = document.querySelectorAll('.content-section');
        this.calcDisplay = document.getElementById('display');
        this.calcInput = document.getElementById('input');
        this.calcOutput = document.getElementById('output');
        this.calHistory = document.getElementById('calHistory');
        this.calButtons = document.querySelectorAll('.btn-controls div');
        this.dashboardHistory = document.querySelectorAll('.history, .history svg');
        this.modalMenu = document.querySelectorAll('.modal-Nav div');
        this.modalFormElements = document.querySelectorAll('.forms form');

        //Modal DOMs
        this.modalBoard = document.querySelector('.modal');
        this.popupBtns = document.querySelectorAll('.loadPopup, .close-modal, .modal');
        this.modalSubmit = document.querySelectorAll('.modal-btn button')
        //DOMS for Transaction Modal
        this.transTable = document.querySelector('.transTable');
        this.transType = document.querySelector('#trans-type');
        this.transName = document.getElementById('trans-name');
        this.transDescr = document.getElementById('trans-description');
        this.transRate = document.getElementById('trans-rate');
        this.transAmount = document.getElementById('trans-amount');
        this.transDate = document.getElementById('trans-date');
        this.transForm = document.getElementById('transaction-form')


        //Authentication DOMs
        //The two main screens
        this.authScreen = document.getElementById('auth-screen');
        this.appContainer = document.getElementById('app-container');
        //email and password inputs
        this.emailInput = document.getElementById('auth-email');
        this.passwordInput = document.getElementById('auth-password');
        //login and signup buttons
        this.loginBtn = document.getElementById('login-btn');
        this.signupBtn = document.getElementById('signup-btn');
        this.authMsg = document.getElementById('auth-msg');
        //logout button in the side menu
        this.logoutBtn = document.querySelector("[data-section='logout']");
        

        //initializer
        this.init();

    }

    init(){
        this.setupEventListeners();
        this.handleAuth();

    }

    setupEventListeners(){
        //setup the theme toggle
        //setup the Side Menu buttons
        this.sideMenu.forEach(item => {
            item.addEventListener('click', () =>{
                this.sideMenu.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                const section = item.getAttribute('data-section');
                this.menuContents.forEach(sec => sec.classList.remove('active'));
                document.getElementById(section).classList.add('active');
            });
        });

        //dashboard buttons
        this.dashboardHistory.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const clicktrans = document.querySelector("[data-section = 'transactions']");
                const clickbudg = document.querySelector("[data-section = 'budgets']");

                if(action === 'trans'){
                    if(clicktrans){
                        clicktrans.click();
                    }
                }

                if(action === 'budg'){
                    if(clickbudg){
                        clickbudg.click();
                    }
                }
            });
        });
        

        //Setup the Calculator components
        this.calButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const value = e.target.dataset.value;

                if(action === 'clr'){
                    this.clearDisplay();
                }else if (action === 'del'){
                    this.deleteLastCharater();
                }else if (action === 'equal'){
                    this.calculate();
                }else if(value === '+' || value === '-' || value === 'x' || value === '÷' || value === '%'){
                    this.moveToInput(value);
                }else if(value){
                    this.appendValue(value);
                }
            });
        });

        //setup transaction components
    
        //budget buttons
        //to-do buttons
        //invoice buttons

        //modal event popup
        let popupModal = false;
        this.setupModal(popupModal);

        //for Popup modal buttons to open and scroll modal cards to view
        this.popupBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const checkID = e.target.id;


                if(checkID === 'autoFill'){
                    popupModal = true;
                    this.setupModal(popupModal);
                    this.autofill();
                }else if(checkID === 'close'){
                    popupModal = false;
                    this.setupModal(popupModal);
                }else if(checkID === 'to-do'){
                    popupModal = true;
                    this.setupModal(popupModal);
                    this.modalFormElements[2].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // Prevents vertical page jumping
                    inline: 'center'  // Centers horizontally
                    });
                    document.getElementById('nav-todo').click();
                }else if(checkID === 'budget'){
                    popupModal = true;
                    this.setupModal(popupModal);
                    this.modalFormElements[1].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // Prevents vertical page jumping
                    inline: 'center'  // Centers horizontally
                    });
                    document.getElementById('nav-budget').click();
                }else if(checkID === 'transaction'){
                    popupModal = true;
                    this.setupModal(popupModal);
                    this.modalFormElements[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // Prevents vertical page jumping
                    inline: 'center'  // Centers horizontally
                    });
                    document.getElementById('nav-transaction').click();
                }
            });
        });

        //for Modal navigation buttons to scroll modal cards to view
        this.modalMenu.forEach(btn => {
            btn.addEventListener('click', (e) =>{
                this.modalMenu.forEach(item => item.classList.remove('active'));
                btn.classList.add('active');

                const currentBtn = e.target;

                if(currentBtn.innerText === 'Transactions'){
                    this.modalFormElements[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // Prevents vertical page jumping
                    inline: 'center'  // Centers horizontally
                    });
                }else if(currentBtn.innerText === 'Budget'){
                    this.modalFormElements[1].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // Prevents vertical page jumping
                    inline: 'center'  // Centers horizontally
                    });
                }else if(currentBtn.innerText === 'To do'){
                    this.modalFormElements[2].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // Prevents vertical page jumping
                    inline: 'center'  // Centers horizontally
                    });
                }
            });
        });



            //Modal Inputs Date-Formatter
                const today = new Date();
                //formate date to YYYY-MM-DD
                const year = today.getFullYear();
                let month = today.getMonth() + 1;
                let day = today.getDate();

                //pad single digits with with zero in front of them
                if(month < 10) month = '0' + month;
                if(day < 10) day = '0' + day;

                //set the value of the formatted version to the input field
                this.transDate.value = `${year}-${month}-${day}`;

            
            
        //For all submit buttons in modal cards
            this.modalSubmit.forEach(btn => {
            btn.addEventListener('click', (e) =>{
                const buttonType = e.target.innerText;

                if(buttonType === 'Add New Transaction'){
                    this.addNewTransaction();
                    this.resetForm();
                        //Modal Inputs Date-Formatter
                        const today = new Date();
                        //formate date to YYYY-MM-DD
                        const year = today.getFullYear();
                        let month = today.getMonth() + 1;
                        let day = today.getDate();

                        //pad single digits with with zero in front of them
                        if(month < 10) month = '0' + month;
                        if(day < 10) day = '0' + day;

                        //set the value of the formatted version to the input field
                        this.transDate.value = `${year}-${month}-${day}`;

                }else if(buttonType === 'Add New Goal'){
                    this.addNewBudget();
                }else if(buttonType === 'Add New Task'){
                    this.addNewTodo();
                }
            });
        });

    }

    //Authentication State Handler
    handleAuth() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Show app
                this.authScreen.style.display = "none";
                this.appContainer.style.display = "flex";

                // Optional: show user email
                document.getElementById("username").innerText = user.email;

                //load all data in the database here
                this.loadTransaction(user);

            } else {
                // Show login
                this.authScreen.style.display = "flex";
                this.appContainer.style.display = "none";
            }
        });

        // LOGIN with email and password
        this.loginBtn.addEventListener('click', async () => {
                if(this.emailInput.value === '' || this.passwordInput.value === ''){
                    this.authMsg.innerText = "Please enter both email and password.";
                    return;
                }

            try {
                await signInWithEmailAndPassword(
                    auth,
                    this.emailInput.value,
                    this.passwordInput.value
                );
            } catch (err) {
                this.authMsg.innerText = err.message;
            }
        });

        // SIGNUP with email and password
        this.signupBtn.addEventListener('click', async () => {
            if(this.emailInput.value === '' || this.passwordInput.value === ''){
                    this.authMsg.innerText = "Please enter both email and password before signing up.";
                    return;
                }

            try {
                await createUserWithEmailAndPassword(
                    auth,
                    this.emailInput.value,
                    this.passwordInput.value
                );
            } catch (err) {
                this.authMsg.innerText = err.message;
            }
        });
        
        //LOGOUT event listener
        this.logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
        });
    }

    //calculator section
    appendValue(value){
        if(this.calcOutput.innerText === '0' || this.calcOutput.innerText === 'Math Error'){
            this.calcOutput.innerText = value;
        } else{
            this.calcOutput.innerText += value;
        }
    }

    //move value from output to input when an operator is clicked, then append the operator to the input
    moveToInput(value){
        if(this.calcOutput.innerText === '0' || this.calcOutput.innerText === 'Math Error'){
            this.calcOutput.innerText = '0';
            this.calcInput.innerText = '0';

        }else if (this.calcInput.innerText === '0'){
            this.calcOutput.innerText += value;
            this.calcInput.innerText = this.calcOutput.innerText;
            this.calcOutput.innerText = '0';
        }else if (this.calcInput.innerText !== '0'){
            this.calcInput.innerText += this.calcOutput.innerText;
            const result = eval(this.calcInput.innerText.replace(/÷/g,'/').replace(/x/g, '*'));
            this.calcInput.innerText = result;
            this.calcInput.innerText += value;
            this.calcOutput.innerText = '0';

        }
    }

    //clear the calculator display
    clearDisplay(){
        this.calcInput.innerText = '0';
        this.calcOutput.innerText = '0';
    }

    //delete the last character from the output display
    deleteLastCharater(){
        if(this.calcOutput.innerText.length > 1){
            this.calcOutput.innerText = this.calcOutput.innerText.slice(0, -1);
        }else{
            this.calcOutput.innerText = '0';
        }
    }

    //evaluate the expression in the input and output displays and show the result in the output display
    calculate(){
        try{
            const innerResult = this.calcInput.innerText + this.calcOutput.innerText;
            const result = eval(innerResult.replace(/÷/g,'/').replace(/x/g, '*'));
            this.calcOutput.innerText = result;
        } catch (e){
            this.calcOutput.innerText = 'Math Error';
        }

        this.calcInput.innerText = '0';
    }

    //Modal Setup
    setupModal(popupModal){
        this.modalBoard.classList.toggle('active', popupModal)
    }

    //Autofill the amount in the modal form with the final result from the calculator  
    autofill(){
        if(this.calcOutput.innerText > 1){
            this.transAmount.value = this.calcOutput.innerText;
        }else if(this.calcOutput.innerText === '0' || this.calcOutput.innerText === 'Math Error'){
            return;
        }
    }


    //load transactions from the dbase
    async loadTransaction(user){
        console.log("Loading transactions...");

            const q = query(
                collection(db, "users", user.uid, "transactions"),
                orderBy("createdAt", "desc")
            );

            onSnapshot(q, (snapshot) => {
                console.log("Docs count:", snapshot.size); //checks Database connection and if transactions are being retrieved

                this.transTable.innerHTML = "";// clears existing transactions

                snapshot.forEach(doc => {
                    console.log(doc.data()); //logs each transaction data to the console for debugging
                    this.renderTransaction(doc.data());
                });
            });    

           
    }

    //Add a new transaction to the transaction list
    async addNewTransaction(){
        const user = auth.currentUser;
        if(!user){
            alert("You must be logged in");
            return;
        }

        if (!this.transName.value || !this.transAmount.value) {
            alert("Fill required fields");
            return;
        }

        //create a transaction object with the form data
        const transactionData = {
            type: this.transType.value,
            name: this.transName.value,
            description: this.transDescr.value,
            currency: this.transRate.value,
            amount: Number(this.transAmount.value),
            date: this.transDate.value,
            createdAt: new Date()

        };


        //add the transaction to the dbase
        try{
            await addDoc(
                collection(db, "users", user.uid, "transactions"),
                transactionData
            );

            console.log("Transaction added successfully");

        } catch (err){
            console.error(err);
        }
    }

    //render Data to the screen
    renderTransaction(data){
        const newTransaction = document.createElement('div');
        newTransaction.classList = 't-items';

        const sign = data.type === 'income' ? '+' : "-";
        const cls = data.type === 'income' ? 'in' : "out";

        newTransaction.innerHTML =`
            <div class="${cls} icon"></div>
            <div>${data.name}</div>
            <div>${data.description}</div>
            <div class="${cls}">
                ${sign}${data.currency}${Number(data.amount).toLocaleString()}
            </div>
            <div>${data.date}</div>
        `

        this.transTable.appendChild(newTransaction);
    }

    //Reset Modal form
    resetForm(){
        this.transForm.reset();
    }
}

// initialize calculator when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new runApp();
});
