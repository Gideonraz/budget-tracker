let db;
let request = indexedDB.open('BudgetDB', 1)

request.onupgradeneeded = function (event) {
    var database = event.target.result
    database.createObjectStore('Pending', {autoIncrement: true});
}

request.onsuccess = function (event) {
    db = event.target.result
      // Checks to see if the app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(`Error ${event.target.errorCode}`);
};

function checkDatabase() {
    // This opens a transaction on the db
    const transaction = db.transaction(['Pending'], 'readwrite');
    // This accesses a Pending object
    const store = transaction.objectStore('Pending');
    // Gets all the records from store and sets to a variable
    const getAll = store.getAll();
    getAll.onsuccess = function () {
        // If there are items in the store, we need to bulk add them once we are back online
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
            })
            .then((response) => response.json())
            .then((data) => {
                // Opens another transaction to Budget with the ability to read and write
                const transaction = db.transaction(['Pending'], 'readwrite');
                // Assigns the store to a variable
                const store = transaction.objectStore('Pending');
                // Clears out the existing entries because our bulk add was successful
                store.clear();
            })
        }
    }
}

const saveRecord = (record) => {
    const transaction = db.transaction(['Pending'], 'readwrite');
    const store = transaction.objectStore('Pending');
    store.add(record);
}

// Listens to check for app coming back online
window.addEventListener('online', checkDatabase);