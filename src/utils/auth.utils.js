import { Client, Account } from "appwrite";

function login() {
const projectID = import.meta.env.APP_WRITE_PROJECT_ID;
return console.log(projectID);

const client = new Client()
    .setProject('<PROJECT_ID>'); // Your project ID

const account = new Account(client);

const promise = account.createEmailPasswordSession('email@example.com', 'password');

promise.then(function (response) {
    console.log(response); // Success
}, function (error) {
    console.log(error); // Failure
});
}

export {login}