import { Account, OAuthProvider } from "appwrite";
import { client } from "./appWrite";



 const account = new Account(client);

function login(email:string, password:string) {
return account.createEmailPasswordSession(email, password);

}

async function googleLogin() {
    const homeUrl = window.location.origin
   account.createOAuth2Session(OAuthProvider.Google, homeUrl, window.location.href);
}

async function getUserData() {
    const session = await account.getSession("current");
   return session;
}


async function signOut() {
    const account = new Account(client);
    const result = await account.deleteSession("current")
    return result;
}




export {login, googleLogin, getUserData, signOut}