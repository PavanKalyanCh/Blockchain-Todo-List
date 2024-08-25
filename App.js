var web3;
var address = "0x92216b611c483d817659809DCC412E262d93B1e7";

// Connect to the provider
async function connect() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            displayError("User denied account access");
        }
    } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
        console.warn('No web3 provider detected, using local fallback');
    }
}

// ABI of the contract
var abi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            }
        ],
        "name": "addTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "completeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "deleteTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "completed",
                "type": "bool"
            }
        ],
        "name": "TaskCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "completed",
                "type": "bool"
            }
        ],
        "name": "TaskCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "TaskDeleted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "getTask",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "taskCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "tasks",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "completed",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Instantiate the contract
var contract;

// Wait until the connection is established
connect().then(() => {
    contract = new web3.eth.Contract(abi, address);
    showTask();  // Optionally show task on load
});

// Add Task function
async function addTask() {
    const taskDescription = document.getElementById("amount").value.trim();
    if (!taskDescription) {
        displayError("Task description cannot be empty.");
        return;
    }

    setLoading(true);
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.addTask(taskDescription).send({ from: accounts[0] });
        document.getElementById("amount").value = "";
        showTask();
    } catch (error) {
        displayError("Error adding task: " + error.message);
    } finally {
        setLoading(false);
    }
}

// Complete Task function
async function completeTask(taskId) {
    setLoading(true);
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.completeTask(taskId).send({ from: accounts[0] });
        showTask();
    } catch (error) {
        displayError("Error completing task: " + error.message);
    } finally {
        setLoading(false);
    }
}

// Delete Task function
async function deleteTask(taskId) {
    setLoading(true);
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.deleteTask(taskId).send({ from: accounts[0] });
        showTask();
    } catch (error) {
        displayError("Error deleting task: " + error.message);
    } finally {
        setLoading(false);
    }
}

// Show Task function
async function showTask() {
  try {
      const taskCount = await contract.methods.taskCount().call();
      let taskDisplay = "";

      for (let i = 1; i <= taskCount; i++) {
          const task = await contract.methods.getTask(i).call();

          // Only show tasks that have a valid description, assuming deleted tasks might have an empty description
          if (task[1] !== "") {
              const isCompleted = task[2] ? "completed" : "";
              taskDisplay += `
                  <div class="task">
                      <span class="${isCompleted}">ID: ${task[0]}, Description: ${task[1]}, Completed: ${task[2]}</span>
                      <button onclick="completeTask(${task[0]})" class="complete">Complete</button>
                      <button onclick="deleteTask(${task[0]})" class="delete">Delete</button>
                  </div>
              `;
          }
      }

      document.getElementById("balance").innerHTML = taskDisplay || "No tasks available";
  } catch (error) {
      displayError("Error fetching tasks: " + error.message);
  }
}


// Set loading state
function setLoading(isLoading) {
    const loader = document.getElementById("loader");
    loader.style.display = isLoading ? "block" : "none";
}

// Display error message
function displayError(message) {
    const errorDiv = document.getElementById("error-message");
    errorDiv.innerText = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
        errorDiv.style.display = "none";
    }, 5000);
}
