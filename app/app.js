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
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
//import from authentication packages
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

class runApp {
  constructor() {
    this.sideMenu = document.querySelectorAll(".main-nav li, .footer-nav li");
    this.menuContents = document.querySelectorAll(".content-section");
    this.calcDisplay = document.getElementById("display");
    this.calcInput = document.getElementById("input");
    this.calcOutput = document.getElementById("output");
    this.calHistory = document.getElementById("calHistory");
    this.calButtons = document.querySelectorAll(".btn-controls div");
    this.dashboardHistory = document.querySelectorAll(".history, .history svg");
    this.modalMenu = document.querySelectorAll(".modal-Nav div");
    this.modalFormElements = document.querySelectorAll(".forms form");

    //Modal DOMs
    this.modalBoard = document.querySelector(".modal");
    this.popupBtns = document.querySelectorAll(
      ".loadPopup, .close-modal, .modal",
    );
    this.modalSubmit = document.querySelectorAll(".modal-btn button");
    //DOMS for Transaction Modal
    this.transTable = document.querySelector(".transTable");
    this.filterType = document.querySelector(".filter-group.type select");
    this.filterMonth = document.getElementById("transaction-month");
    // all transactions will be stored in this array for filtering and rendering purposes
    this.allTransactions = [];
    // tracks whether we're currently editing a transaction or adding a new one.
    this.editingId = null;
    // store the current user in this variable after authentication to easily access their uid for database operations. It will be set to null when the user logs out.
    this.currentUser = null;

    this.transType = document.querySelector("#trans-type");
    this.transName = document.getElementById("trans-name");
    this.transDescr = document.getElementById("trans-description");
    this.transRate = document.getElementById("trans-rate");
    this.transAmount = document.getElementById("trans-amount");
    this.transDate = document.getElementById("trans-date");
    this.transForm = document.getElementById("transaction-form");

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

    //initializer
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.handleAuth();
  }

  setupEventListeners() {
    //setup the theme toggle
    //setup the Side Menu buttons
    this.sideMenu.forEach((item) => {
      item.addEventListener("click", () => {
        this.sideMenu.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");

        const section = item.getAttribute("data-section");
        this.menuContents.forEach((sec) => sec.classList.remove("active"));
        document.getElementById(section).classList.add("active");
      });
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

    //setup transaction components
    this.filterType.addEventListener("change", () => this.applyFilters());
    this.filterMonth.addEventListener("change", () => this.applyFilters());

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

    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("createdAt", "desc"),
    );

    onSnapshot(q, (snapshot) => {
      console.log("Docs count:", snapshot.size); //checks Database connection and if transactions are being retrieved

      this.allTransactions = [];

      snapshot.forEach((doc) => {
        console.log(doc.data());
        this.allTransactions.push({ id: doc.id, ...doc.data() });
      });
      this.populateMonthFilter();
      this.applyFilters();
    });
  }

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
  populateMonthFilter() {
    const currentSelection = this.filterMonth.value;

    const months = [
      ...new Set(
        this.allTransactions
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

  applyFilters() {
    const typeVal = this.filterType.value;
    const monthVal = this.filterMonth.value;

    const filtered = this.allTransactions.filter((t) => {
      const matchType = typeVal === "all" || t.type === typeVal;
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
      return matchType && matchMonth;
    });

    this.transTable.innerHTML = "";
    filtered.forEach((t) => this.renderTransaction(t));
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
        <div class="action-menu-wrap">
            <button class="three-dot-btn">⋮</button>
            <div class="action-dropdown hidden">
                <p class="action-edit"> Edit</p>
                <p class="action-delete"> Delete</p>
            </div>
        </div>
    `

    const dotBtn = newTransaction.querySelector('.three-dot-btn');
    const dropdown = newTransaction.querySelector('.action-dropdown');

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
