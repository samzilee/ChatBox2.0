import { Client, Databases, Storage  } from "appwrite";
const projectID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export const client  = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject(projectID)

export const databases = new Databases(client);
export const storage = new Storage(client);   