
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_tracker', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    record.new = true;
    const transaction = db.transaction(['new_tracker'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_tracker');

    budgetObjectStore.add(record);
};


// function cacheRecords(records){
//     const transaction = db.transaction(['new_tracker'], 'readwrite');
//     const budgetObjectStore = transaction.objectStore('new_tracker');
//     records.map(budgetObjectStore.add);
   
// }

// function getRecord() {
//     return new Promise((resolve) => {
//         db.transaction('new_tracker')
//             .objectStore('new_tracker')
//             .getAll()
//             .onsuccess = function (event) {
//                 resolve(event.target.result);
//             }
//     })
// };

function uploadBudget() {
    const transaction = db.transaction(['new_tracker'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_tracker');

    const getAll = budgetObjectStore.getAll({new:true});

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json text/plain */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_tracker'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_tracker');
                budgetObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

window.addEventListener('online', uploadBudget);