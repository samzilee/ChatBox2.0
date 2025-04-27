import { client, databases, storage } from "./appWrite";
import { ID, Query } from "appwrite";

const createDocument = (data:any) => {
    const promise = databases.createDocument("chat_box", "posts", ID.unique(), data)
    return promise;
}



const createFile = (filePath:any) => {
    const promise = storage.createFile("68098ea3001135e829f7",ID.unique(), filePath)
    return promise;
}

const getFile = (fileId:string) => {
    const result = storage.getFileView("68098ea3001135e829f7", fileId )
    return result;
}

 const listDocument = async() => {
    const result = await databases.listDocuments("chat_box","posts", [Query.orderDesc("$createdAt")])
    return result;
}

const updateDocument = async(documentID:string, data:any) => {
    const result = await databases.updateDocument("chat_box","posts",documentID, {
        likes:data
    })
    return result;
}


export {createDocument, createFile, getFile, listDocument, updateDocument}

