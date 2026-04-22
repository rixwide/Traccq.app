// Import necessary Firebase modules
//import database and auth packages
import { db, auth } from "./firebase.js";
//import from firestore packages
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  limit,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
//import from authentication packages
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";



class runApp{

    constructor(){
        //Menu DOMS
        this.sideMenu = document.querySelectorAll('.main-nav li, .footer-nav li');
        this.menuContents = document.querySelectorAll('.content-section');
        this.currencySwitch = document.getElementById('switch-currency');
        //This is specially meant to track the current currency code
        this.currentCurrencyCode = "NGN"; // Set your default starting currency

        //Dashboard DOMS
        this.dashboardHistory = document.querySelectorAll('.history, .history svg');
        this.totalIncome = document.getElementById('dashboard-income');
        this.totalExpense = document.getElementById('dashboard-expense');
        this.CurrentBalance = document.getElementById('dashboard-current-balance');


        //Calculator DOMS
        this.calcDisplay = document.getElementById('display');
        this.calcInput = document.getElementById('input');
        this.calcOutput = document.getElementById('output');
        this.calHistory = document.getElementById('calHistory');
        this.calButtons = document.querySelectorAll('.btn-controls div');


        //Modal DOMs
        this.modalMenu = document.querySelectorAll('.modal-Nav div');
        this.modalFormElements = document.querySelectorAll('.forms form');
        this.modalBoard = document.querySelector('.modal');
        this.popupBtns = document.querySelectorAll('.loadPopup, .close-modal, .modal');
        this.modalSubmit = document.querySelectorAll('.modal-btn button');

        //DOMS for Transaction Modal
        this.transTable = document.querySelector('.transTable');
        this.transType = document.querySelector('#trans-type');
        this.transName = document.getElementById('trans-name');
        this.transDescr = document.getElementById('trans-description');
        this.transRate = document.getElementById('trans-rate');
        this.transAmount = document.getElementById('trans-amount');
        this.transDate = document.getElementById('trans-date');
        this.transForm = document.getElementById('transaction-form');

        //Transaction Filter DOMs
        this.filterType = document.getElementById('transaction-type');
        this.filterMonth = document.getElementById('transaction-month');
        this.filterDescription = document.getElementById('transaction-description');


        //Authentication DOMs
        //The two main screens
        this.authScreen = document.getElementById("auth-screen");
        this.appContainer = document.getElementById("app-container");
        //email and password inputs
        this.emailInput = document.getElementById("auth-email");
        this.passwordInput = document.getElementById("auth-password");
        //login and signup buttons
        this.loginBtn = document.getElementById("login-btn");
        this.signupBtn = document.getElementById("signup-btn");
        this.authMsg = document.getElementById("auth-msg");
        //logout button in the side menu
        this.logoutBtn = document.querySelector("[data-section='logout']");

        //state management
        this.state = {
        transactions: [],
        totals: { income: 0, expense: 0, balance: 0 },
        currency: {
            code: "NGN", // The currency code before the recent clicked currency code or default to "NGN"
            symbol: "₦",
            rate: 1, // The conversion rate from the previous currency code to the new currency code, default to 1 for the initial currency
            rates: {},
        },
        filters: { type: "all", month: "all", description: "all" },
        };

        this.baseTotals = { 
            income: 0, 
            expense: 0, 
            balance: 0 
        };

        
        this.unsubscribe = null;

    //initializer
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.handleAuth();
  }

    //All Event listeners
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

        //Switch button in the side menu to switch between different sections of the app
        //It switches symbol in the dashboard when the currency switch is toggled
        this.currencySwitch.addEventListener('change', async (e) => {
            const newSymbol = e.target.value; // Get the new currency code from the selected option's data attribute
            const newCode = e.target.options[e.target.selectedIndex].dataset.code; // Get the new currency code ("like the data-code='NGN' in the HTML") from the selected option's data attribute
            
            if (this.state.currency.code === newCode) return; // No need to convert if the same currency is selected

            try { // Fetch the conversion rate from the API
                let rate = this.state.currency.rates[newCode]; // Check if the conversion rate for the new currency code is already stored in the state
                if (!rate) { // If the conversion rate is not in the state, fetch it from the API
                    const url = `https://v6.exchangerate-api.com/v6/483a115f945b1ac0a922a1bc/latest/NGN`;
                    const response = await fetch(url);
                    const data = await response.json(); // Parse the response as JSON
                    if (data.result !== "success") { // Check if the API returned a successful result
                        throw new Error("API error: " + data['error-type']); // If the API returned an error, throw an error with the error type from the API response
                    }
                    rate = data.conversion_rates[newCode]; // Get the conversion rate for the new currency code from the API response in the parsed JSON data ABOVE
                    this.state.currency.rates[newCode] = rate; // Store the conversion rate in the state for future use to avoid unnecessary API calls for the same currency code
                }
               
                this.state.currency.code = newCode; // Update the current currency code in the state to the new currency code
                this.state.currency.symbol = newSymbol; // Update the current currency symbol in the state to the new currency symbol
                this.state.currency.rate = rate; // Update the current conversion rate in the state to the new conversion rate

                this.render(); // Re-render the dashboard and transactions with the new currency symbol and converted totals

            } catch (error) { // should in case error occurs at anytime in the cause of API call and conversion this catch function will run to report error
                console.error("Conversion failed:", error);
                alert("Currency conversion failed. Ensure Internet is connected and try again later.");
            }
        });


    //dashboard buttons
    this.dashboardHistory.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        const clicktrans = document.querySelector(
          "[data-section = 'transactions']",
        );
        const clickbudg = document.querySelector("[data-section = 'budgets']");

        if (action === "trans") {
          if (clicktrans) {
            clicktrans.click();
          }
        }

        if (action === "budg") {
          if (clickbudg) {
            clickbudg.click();
          }
        }
      });
    });

    //Setup the Calculator components
    this.calButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        const value = e.target.dataset.value;

        if (action === "clr") {
          this.clearDisplay();
        } else if (action === "del") {
          this.deleteLastCharater();
        } else if (action === "equal") {
          this.calculate();
        } else if (
          value === "+" ||
          value === "-" ||
          value === "x" ||
          value === "÷" ||
          value === "%"
        ) {
          this.moveToInput(value);
        } else if (value) {
          this.appendValue(value);
        }
      });
    });

    //setup transaction filter components
    if (this.filterType) { // Check if the filterType element exists in the DOM before adding an event listener to avoid errors in case the element is not present on certain pages
        this.filterType.addEventListener("change", () => {
            this.state.filters.type = this.filterType.value || "all"; // Update the type filter in the state with the selected value from the filterType dropdown, defaulting to "all" if no value is selected
            this.render(); // This calls renderTransactionsFilters()
        });
    }

    if (this.filterMonth) {
        this.filterMonth.addEventListener("change", () => {
            this.state.filters.month = this.filterMonth.value || "all";
            this.render();
        });
    }

    if (this.filterDescription) {
        this.filterDescription.addEventListener("change", () => {
            this.state.filters.description = this.filterDescription.value || "all";
            this.render();
        });
    }

    //budget buttons
    //to-do buttons
    //invoice buttons

    //modal event popup
    let popupModal = false;
    this.setupModal(popupModal);

    //for Popup modal buttons to open and scroll modal cards to view
    this.popupBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const checkID = e.target.id;

        if (checkID === "autoFill") {
          popupModal = true;
          this.setupModal(popupModal);
          this.autofill();
        } else if (checkID === "close") {
          popupModal = false;
          this.setupModal(popupModal);
        } else if (checkID === "to-do") {
          popupModal = true;
          this.setupModal(popupModal);
          this.modalFormElements[2].scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Prevents vertical page jumping
            inline: "center", // Centers horizontally
          });
          document.getElementById("nav-todo").click();
        } else if (checkID === "budget") {
          popupModal = true;
          this.setupModal(popupModal);
          this.modalFormElements[1].scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Prevents vertical page jumping
            inline: "center", // Centers horizontally
          });
          document.getElementById("nav-budget").click();
        } else if (checkID === "transaction") {
          popupModal = true;
          this.setupModal(popupModal);
          this.modalFormElements[0].scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Prevents vertical page jumping
            inline: "center", // Centers horizontally
          });
          document.getElementById("nav-transaction").click();
        }
      });
    });

    //for Modal navigation buttons to scroll modal cards to view
    this.modalMenu.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.modalMenu.forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");

        const currentBtn = e.target;

        if (currentBtn.innerText === "Transactions") {
          this.modalFormElements[0].scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Prevents vertical page jumping
            inline: "center", // Centers horizontally
          });
        } else if (currentBtn.innerText === "Budget") {
          this.modalFormElements[1].scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Prevents vertical page jumping
            inline: "center", // Centers horizontally
          });
        } else if (currentBtn.innerText === "To do") {
          this.modalFormElements[2].scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Prevents vertical page jumping
            inline: "center", // Centers horizontally
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
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;

    //set the value of the formatted version to the input field
    this.transDate.value = `${year}-${month}-${day}`;

    //For all submit buttons in modal cards
    this.modalSubmit.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const buttonType = e.target.innerText;

        if (buttonType === "Add New Transaction") {
          if (this.editingId) {
            this.saveEdit();
          } else {
            this.addNewTransaction();
          }
          this.editingId = null;
          this.resetForm();
          //Modal Inputs Date-Formatter
          const today = new Date();
          //formate date to YYYY-MM-DD
          const year = today.getFullYear();
          let month = today.getMonth() + 1;
          let day = today.getDate();

          //pad single digits with with zero in front of them
          if (month < 10) month = "0" + month;
          if (day < 10) day = "0" + day;

          //set the value of the formatted version to the input field
          this.transDate.value = `${year}-${month}-${day}`;
        } else if (buttonType === "Add New Goal") {
          this.addNewBudget();
        } else if (buttonType === "Add New Task") {
          this.addNewTodo();
        }
      });
    });

    // this event listener is added so that when the user clicks anywhere outside the action dropdown, it will close any open dropdowns. 
    document.addEventListener('click', () => {
    document.querySelectorAll('.action-dropdown').forEach(d => d.classList.add('hidden'));
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

        this.currentUser = user; // Store the current user
        //load all data in the database here
        this.loadTransaction(user);
      } else {
        // Show login
        this.authScreen.style.display = "flex";
        this.appContainer.style.display = "none";
      }
    });

    // LOGIN with email and password
    this.loginBtn.addEventListener("click", async () => {
      if (this.emailInput.value === "" || this.passwordInput.value === "") {
        this.authMsg.innerText = "Please enter both email and password.";
        return;
      }

      try {
        await signInWithEmailAndPassword(
          auth,
          this.emailInput.value,
          this.passwordInput.value,
        );
      } catch (err) {
        this.authMsg.innerText = err.message;
      }
    });

    // SIGNUP with email and password
    this.signupBtn.addEventListener("click", async () => {
      if (this.emailInput.value === "" || this.passwordInput.value === "") {
        this.authMsg.innerText =
          "Please enter both email and password before signing up.";
        return;
      }

      try {
        await createUserWithEmailAndPassword(
          auth,
          this.emailInput.value,
          this.passwordInput.value,
        );
      } catch (err) {
        this.authMsg.innerText = err.message;
      }
    });

    //LOGOUT event listener
    this.logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
    });
  }



  //calculator section
  appendValue(value) {
    if (
      this.calcOutput.innerText === "0" ||
      this.calcOutput.innerText === "Math Error"
    ) {
      this.calcOutput.innerText = value;
    } else {
      this.calcOutput.innerText += value;
    }
  }

  //move value from output to input when an operator is clicked, then append the operator to the input
  moveToInput(value) {
    if (
      this.calcOutput.innerText === "0" ||
      this.calcOutput.innerText === "Math Error"
    ) {
      this.calcOutput.innerText = "0";
      this.calcInput.innerText = "0";
    } else if (this.calcInput.innerText === "0") {
      this.calcOutput.innerText += value;
      this.calcInput.innerText = this.calcOutput.innerText;
      this.calcOutput.innerText = "0";
    } else if (this.calcInput.innerText !== "0") {
      this.calcInput.innerText += this.calcOutput.innerText;
      const result = eval(
        this.calcInput.innerText.replace(/÷/g, "/").replace(/x/g, "*"),
      );
      this.calcInput.innerText = result;
      this.calcInput.innerText += value;
      this.calcOutput.innerText = "0";
    }
  }

  //clear the calculator display
  clearDisplay() {
    this.calcInput.innerText = "0";
    this.calcOutput.innerText = "0";
  }

  //delete the last character from the output display
  deleteLastCharater() {
    if (this.calcOutput.innerText.length > 1) {
      this.calcOutput.innerText = this.calcOutput.innerText.slice(0, -1);
    } else {
      this.calcOutput.innerText = "0";
    }
  }

  //evaluate the expression in the input and output displays and show the result in the output display
  calculate() {
    try {
      const innerResult = this.calcInput.innerText + this.calcOutput.innerText;
      const result = eval(innerResult.replace(/÷/g, "/").replace(/x/g, "*"));
      this.calcOutput.innerText = result;
    } catch (e) {
      this.calcOutput.innerText = "Math Error";
    }

    this.calcInput.innerText = "0";
  }

  //Modal Setup
  setupModal(popupModal) {
    this.modalBoard.classList.toggle("active", popupModal);
  }

  //Autofill the amount in the modal form with the final result from the calculator
  autofill() {
    if (this.calcOutput.innerText > 1) {
      this.transAmount.value = this.calcOutput.innerText;
    } else if (
      this.calcOutput.innerText === "0" ||
      this.calcOutput.innerText === "Math Error"
    ) {
      return;
    }
  }

  //load transactions from the dbase
  async loadTransaction(user) {
    console.log("Loading transactions...");

    if (this.unsubscribe) this.unsubscribe(); // prevent duplicates

    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("createdAt", "desc"),
      limit(50) // only lastest 50 transactions will be loaded to optimize performance, you can implement pagination or infinite scrolling to "load more" transactions if needed
    );

      this.unsubscribe = onSnapshot(q, (snapshot) => { // Listen for real-time updates to the transactions collection for the current user, ordered by creation date in descending order, and limited to the latest 50 transactions for performance optimization. 
      // Whenever there is a change in the transactions collection (like addition, modification, or deletion of a transaction), this callback function will be triggered with the updated snapshot of the transactions data.
          snapshot.docChanges().forEach(change => {

              const data = { 
                  id: change.doc.id,
                  ...change.doc.data()
              };// For each change in the transactions collection, we create a data object that includes the transaction id and its data from the document snapshot. 
              // This data object will be used to update the state of transactions in the app based on the type of change (added, modified, or removed).

              if (change.type === "added") {
                  this.state.transactions.unshift(data); // If a new transaction is added, we add it to the beginning of the transactions array in the state using unshift to maintain the order of transactions with the latest ones at the top.
              }

              if (change.type === "modified") {
                  const index = this.state.transactions.findIndex(t => t.id === data.id);
                  if (index !== -1) this.state.transactions[index] = data;
              } // If a transaction is modified, we find its index in the transactions array in the state using findIndex and update it with the new data if it exists.

              if (change.type === "removed") {
                  this.state.transactions =
                      this.state.transactions.filter(t => t.id !== data.id);
              } // If a transaction is removed, we filter it out from the transactions array in the state by creating a new array that includes only the transactions whose id does not match the id of the removed transaction.
          });

            this.calculateTotals(); // Calculate the totals for income, expense, and balance based on the loaded transactions
            this.populateMonthFilter(); // Populate the month filter dropdown with the unique months from the loaded transactions
             this.populateDescriptionFilter?.(); // Populate the description filter dropdown with the unique descriptions from the loaded transactions (optional chaining is used here to ensure that this function is only called if the filterDescription element exists in the DOM, preventing errors on pages where it may not be present)
            this.render(); // Render the transactions and updated totals on the dashboard
      });
}
            
        //Calculate the totals for income, expense, and balance based on the transactions in the state
    calculateTotals() { // Calculate the totals for income, expense, and balance based on the transactions in the state
        let income = 0;
        let expense = 0;

        this.state.transactions.forEach(t => {
            if (t.type === "income") {
                income += Number(t.amount) || 0; // If the transaction type is "income", add its amount to the total income 
            } else if (t.type === "expense") {
                expense += Number(t.amount) || 0; // If the transaction type is "expense", add its amount to the total expense
            }
        });

        const balance = income - expense; // Calculate the balance by subtracting total expense from total income
       
       // Store the calculated totals in the baseTotals variable to keep track of the original totals in the default currency (NGN) for accurate conversion when switching currencies
        this.baseTotals = { income, expense, balance, };

        // Update the totals in the state with the calculated values for income, expense, and balance to be used for rendering the dashboard and for currency conversion when switching currencies using the currency switch in the side menu
        this.state.totals = {income, expense, balance,};
    }

    //Render Engine
    render() {
        this.renderDashboard(); // Render the dashboard with the updated totals for income, expense, and balance
        this.renderTransactionsFilters(); // Re-render the transactions on the screen based on the current filters applied (type, month, description) to show only the transactions that match the selected filters
    }

    renderDashboard() {
        const { income, expense, balance } = this.baseTotals; // Get the base totals for income, expense, and balance in the default currency (NGN) to ensure accurate conversion when switching currencies
        const {symbol, rate} = this.state.currency;

        const convert = (val) => val * rate; // Function to convert the base totals to the current currency using the conversion rate from the state

        this.totalIncome.innerText =
            `${symbol}${convert(income).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        this.totalExpense.innerText =
            `${symbol}${convert(expense).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        this.CurrentBalance.innerText =
            `${symbol}${convert(balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
      }

    renderTransactionsFilters() {
        const {transactions, filters} = this.state;

        this.transTable.innerHTML = ""; // Clear the transaction table before rendering

        const filteredTransactions = transactions.filter(t => {
            // Type filter - FIX: Ensure proper comparison
            const matchType =
                filters.type === "all" || t.type === filters.type;

            // Month filter
            const matchMonth =
                filters.month === "all" || (() => {
                    if (!t.date) return false;
                    const [year, month] = t.date.split("-");
                    if (!year || !month) return false;
                    const d = new Date(year, month - 1);
                    return d.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                    }) === filters.month;
                })();

            // Description filter - FIX: Add proper null/undefined checks
            const matchDescription =
                filters.description === "all" ||
                (t.description && t.description.toLowerCase().trim() === filters.description.toLowerCase().trim());

            return matchType && matchMonth && matchDescription;
        });

        filteredTransactions.forEach(t => this.renderTransaction(t));
    }

        //render Data to the screen
    renderTransaction(data){
        const newTransaction = document.createElement('div');
        newTransaction.classList = 't-items';

        const sign = data.type === 'income' ? '+' : "-";
        const cls = data.type === 'income' ? 'in' : "out";

        // Get the conversion rate from the state for the current currency and convert the transaction amount to the current currency using the conversion rate before displaying it on the screen. 
        // This ensures that the transaction amounts are displayed in the correct currency when the user switches between different currencies using the currency switch in the side menu.
        const rate = this.state.currency.rate || 1;
        const symbol = this.state.currency.symbol || "";

        const convertedAmount = Number(data.amount) * rate;

        newTransaction.innerHTML =`
            <div class="${cls} icon"></div>
            <div>${data.name}</div>
            <div>${data.description}</div>
            <div class="${cls}">
                ${sign}${this.state.currency.symbol}${convertedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
            </div>
            <div>${data.date}</div>
            <div class="action-menu-wrap">
                <button class="three-dot-btn">⋮</button>
                <div class="action-dropdown hidden">
                    <p class="action-edit"> Edit</p>
                    <p class="action-delete"> Delete</p>
                </div>
            </div>
        `

        const dotBtn = newTransaction.querySelector('.three-dot-btn'); // Select the three-dot button within the newly created transaction element to add an event listener for toggling the action dropdown menu when the button is clicked
        const dropdown = newTransaction.querySelector('.action-dropdown'); // Select the action dropdown menu within the newly created transaction element to toggle its visibility when the three-dot button is clicked

        dotBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.action-dropdown').forEach(d => d.classList.add('hidden'));
            dropdown.classList.toggle('hidden');
        });

        newTransaction.querySelector('.action-delete').addEventListener('click', () => {
            this.deleteTransaction(data.id);
        });

        newTransaction.querySelector('.action-edit').addEventListener('click', () => {
            this.openEditModal(data);
        });

        this.transTable.appendChild(newTransaction);
    }

  //CRUD - Create, Read, Update, Delete functions for transactions
  //Add a new transaction to the transaction list
  async addNewTransaction() {
    const user = auth.currentUser;
    if (!user) {
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
      createdAt: new Date(),
    };

    //add the transaction to the dbase
    try {
      await addDoc(
        collection(db, "users", user.uid, "transactions"),
        transactionData,
      );

      console.log("Transaction added successfully");
    } catch (err) {
      console.error(err);
    }
  }

  // Populate the month filter dropdown with unique months from transactions
  populateMonthFilter() {
    if (!this.filterMonth) return; // If the month filter element does not exist in the DOM, exit the function to avoid errors

    const currentSelection = this.filterMonth.value || "all";// Store the current selection to reapply it after repopulating the options

    const months = [
      ...new Set(
        this.state.transactions
          .map((t) => {
            if (!t.date) return null;
            const [year, month] = t.date.split("-");
            if (!year || !month) return null;
            const d = new Date(year, month - 1);
            return d.toLocaleString("default", {
              month: "long",
              year: "numeric",
            });
          })
          .filter(Boolean),
      ),
    ];

    this.filterMonth.innerHTML = '<option value="all">Month</option>';
    months.forEach((month) => {
      const opt = document.createElement("option");
      opt.value = month;
      opt.textContent = month;
      this.filterMonth.appendChild(opt);
    });

    if (
      [...this.filterMonth.options].some((o) => o.value === currentSelection)
    ) {
      this.filterMonth.value = currentSelection;
    }
  }

  // Populate the description filter dropdown with unique descriptions from transactions
  populateDescriptionFilter() {
    if (!this.filterDescription) return;

    const current = this.filterDescription.value || "all";

    const descriptions = [
        ...new Set(
            this.state.transactions
                .map(t => t.description)
                .filter(Boolean)
        )
    ];

    this.filterDescription.innerHTML =
        '<option value="all">All Descriptions</option>';

    descriptions.forEach(desc => {
        const opt = document.createElement("option");
        opt.value = desc;
        opt.textContent = desc;
        this.filterDescription.appendChild(opt);
    });

    if ([...this.filterDescription.options].some(o => o.value === current)) {
        this.filterDescription.value = current;
    }
}


  applyFilters() {
    const typeVal = this.filterType.value;
    const monthVal = this.filterMonth?.value;
    const descVal = this.filterDescription?.value;

    const filtered = this.state.transactions.filter((t) => {
      //type filter
      const matchType = typeVal === "all" || t.type === typeVal;

      //month filter
      const matchMonth =
        monthVal === "all" ||
        (() => {
          if (!t.date) return false;
          const [year, month] = t.date.split("-");
          if (!year || !month) return false;
          const d = new Date(year, month - 1);
          return (
            d.toLocaleString("default", { month: "long", year: "numeric" }) ===
            monthVal
          );
        })();

        //description filter
        const matchDescription =
        descVal === "all" || t.description === descVal;

      return matchType && matchMonth && matchDescription;
    });

    // Clear the transaction table before rendering the filtered transactions to avoid duplicates and ensure that only the transactions that match the selected filters are displayed on the screen when the filters are applied
    this.transTable.innerHTML = "";
    filtered.forEach((t) => this.renderTransaction(t));
  }

//   function to delete a transaction from the database using its id
  deleteTransaction(id) {
    const ref = doc(db, "users", this.currentUser.uid, "transactions", id);
    deleteDoc(ref);
  }
//   funtion to edit a transaction - it opens the modal and pre-fills the form with the existing data, then when saved it updates the existing transaction in the database instead of creating a new one
  openEditModal(data) {
    this.editingId = data.id; // put the id of the transaction being edited in the editingId variable to keep track of it
    // pre-fill the form with the existing data
    this.transType.value = data.type; 
    this.transName.value = data.name;
    this.transDescr.value = data.description;
    this.transRate.value = data.currency;
    this.transAmount.value = data.amount;
    this.transDate.value = data.date;
    this.setupModal(true);
    this.modalFormElements[0].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    document.getElementById("nav-transaction").click();
  }

  saveEdit() {
    const ref = doc(
      db,
      "users",
      this.currentUser.uid,
      "transactions",
      this.editingId,
    );
    updateDoc(ref, {
      type: this.transType.value,
      name: this.transName.value,
      description: this.transDescr.value,
      currency: this.transRate.value,
      amount: Number(this.transAmount.value),
      date: this.transDate.value,
    });
  }
  //Reset Modal form
  resetForm() {
    this.transForm.reset();
  }
}

// initialize calculator when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new runApp();
});
