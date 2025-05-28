import { databases, storage } from "./appWrite";

import { ID, Query } from "appwrite";

const createDocument = (collectionID:string,data:any) => {
    const result = databases.createDocument("chat_box", collectionID, ID.unique(), data)
    return result;
}

const createDocumentCustomID = (collectionID:string, documentID:string, data:any) => {
    const result = databases.createDocument("chat_box", collectionID, documentID, data)
    return result;
}



const deleteDocument = ( collectionID:string ,documentID:string) => {
const result = databases.deleteDocument("chat_box", collectionID, documentID)
    return result;
}



const createFile = (filePath:any) => {
    const promise = storage.createFile("68098ea3001135e829f7",ID.unique(), filePath)
    return promise;
}

const getFile = (fileId:string) => {
    const result = storage.getFileView("68098ea3001135e829f7", fileId )
    return result;
}
const deleteFile = (fileId:string) => {
    const result = storage.deleteFile("68098ea3001135e829f7", fileId);
    return result;
}

 const listDocument = async(documentID:string, listOder:string) => {
    const result = await databases.listDocuments("chat_box", documentID, [listOder === "new-to-old" ?  Query.orderDesc("$createdAt")  : Query.orderAsc("$createdAt")] )
    return result;
}

const checkForUser = async(userId:string) => {
    const user = await databases.listDocuments("chat_box", "User", [Query.equal("userId", userId)] )

   return user

}

const updateLikes = async(documentID:string, data:any) => {
    const result = await databases.updateDocument("chat_box","posts",documentID, {
        likes:data
    })
    return result;
}

const updateComments = async (documentID:string,data:any) => {
    const result = await databases.updateDocument("chat_box", "posts", documentID, {
        comments: data
    })
    return result;
}

const updateUser = async (documentID:string, data:any) => {
    const result = await databases.updateDocument("chat_box","Users", documentID, data);
    return result;
}




export {createDocument, createDocumentCustomID, checkForUser, createFile, getFile, deleteFile, listDocument, updateLikes, updateComments, updateUser, deleteDocument}

