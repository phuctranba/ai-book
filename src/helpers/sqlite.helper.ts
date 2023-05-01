import {EnumTypeMessageInLocal, TypedChatHistory} from "models/chat.model";
import {openDatabase} from "react-native-sqlite-storage";
import {TypedBookSummary} from "models/book.modal";

export async function insertBook(book: TypedBookSummary) {
    try {
        DB.transaction(function (tx) {
            tx.executeSql(`INSERT OR REPLACE INTO ${TABLE_BOOK} (id, dateSummary, content) VALUES (?,?,?)`,
                [book.id, book.dateSummary, JSON.stringify(book)]);
        }, function (error) {
            console.log(`Insert ${TABLE_BOOK} ERROR: ${error.message}`);
        }, function () {
            console.log(`Insert ${TABLE_BOOK} SUCCESS`);
        });
    } catch (error) {
    }
}

export async function getAllBook(): Promise<TypedBookSummary[]> {
    return new Promise((resolve, reject) => {
        try {
            DB.transaction(async (tx) => {
                await tx.executeSql(`SELECT * FROM ${TABLE_BOOK} ORDER BY dateSummary`, [], (tx, results) => {
                    let books: TypedBookSummary[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        try {
                            let book: TypedBookSummary = JSON.parse(results.rows.item(i).content);
                            books = [...books, book]
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    resolve(books);
                });
            }, function (error) {
                console.log(`Get message ${TABLE_BOOK} ERROR: ${error.message}`);
                reject(error)
            }, function () {
                console.log(`Get message ${TABLE_BOOK} SUCCESS`);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export async function getBookById(bookId: string): Promise<TypedBookSummary> {
    return new Promise((resolve, reject) => {
        try {
            DB.transaction(async (tx) => {
                // await tx.executeSql(`SELECT * FROM ${TABLE_BOOK} WHERE type = '${typeMessage}'${idLastMessage ? ` AND id < ${idLastMessage}` : ""} ORDER BY id DESC LIMIT 20`, [], (tx, results) => {

                await tx.executeSql(`SELECT * FROM ${TABLE_BOOK} WHERE id = '${bookId}'`, [], (tx, results) => {
                    console.log(bookId)
                    console.log(results.rows.item)
                    if(results.rows.item?.(0)){
                        resolve(JSON.parse(results.rows.item(0).content));
                    }else {
                        reject()
                    }

                });
            }, function (error) {
                console.log(`getBookByIde ${TABLE_BOOK} ERROR: ${error.message}`);
                reject(error)
            }, function () {
                console.log(`getBookById ${TABLE_BOOK} SUCCESS`);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export async function getLastMessageOfRoom(tableNameMessage: string): Promise<TypedChatHistory[]> {
    return new Promise((resolve, reject) => {
        try {
            DB.transaction(async (tx) => {
                await tx.executeSql(`SELECT * FROM ${tableNameMessage} ORDER BY id DESC LIMIT 1`, [], (tx, results) => {
                    let messages: TypedChatHistory[] = []
                    for (let i = 0; i < results.rows.length; i++) {
                        try {
                            let message: TypedChatHistory = JSON.parse(results.rows.item(i).message);
                            messages = [...messages, message]
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    resolve(messages);
                });
            }, function (error) {
                console.log(`Get last message of room ${tableNameMessage} ERROR: ${error.message}`);
                reject(error)
            }, function () {
                console.log(`Get last message of room ${tableNameMessage} SUCCESS`);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export async function getMessagesOfRoomPerPage(tableNameMessage: string, idLastMessage?: string): Promise<TypedChatHistory[]> {
    return new Promise((resolve, reject) => {
        try {
            DB.transaction((tx) => {
                tx.executeSql(`SELECT * FROM ${tableNameMessage} WHERE type = '${EnumTypeMessageInLocal.Message}' ${idLastMessage ? ` AND id < ${idLastMessage}` : ""} ORDER BY id DESC LIMIT 20`, [], (tx, results) => {
                    let messages: TypedChatHistory[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        try {
                            let message: TypedChatHistory = JSON.parse(results.rows.item(i).message);
                            messages = [...messages, message]
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    resolve(messages);
                })
            }, function (error) {
                console.log(`Get message ${tableNameMessage} ERROR: ${error.message}`);
                reject(error)
            }, function () {
                console.log(`Get message ${tableNameMessage} from ${idLastMessage} SUCCESS`);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export const DB = openDatabase({
    name: "ai_chat.db",
    location: "default",
    createFromLocation: 2
}, () => console.log("Open DB success"), (error) => console.log("Open DB error: ", error));

/**
 * Table for sqlite
 */
export const TABLE_BOOK = "TABLE_BOOK";

export async function createDB() {
    return new Promise((resolve, reject) => {
        DB.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS " + TABLE_BOOK + " (id TEXT PRIMARY KEY, dateSummary TEXT NOT NULL, content TEXT NOT NULL)");
        }, function (error) {
            console.log("Populated database ERROR: " + error.message);
        }, function () {
            console.log("Populated database OK");
        });
    });
}

export async function createTableChatRoom(tableName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        DB.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS " + tableName + " (id TEXT PRIMARY KEY, type TEXT NOT NULL, message TEXT NOT NULL)");
            resolve(true)
        }, function (error) {
            console.log("createTableChatRoom ERROR: " + tableName + " " + error.message);
            resolve(false)
        }, function () {
            console.log("createTableChatRoom OK " + tableName);
            resolve(true)
        });
    });
}

export async function deleteDataTable(tableName: string) {
    return new Promise((resolve, reject) => {
        DB.transaction(function (tx) {
            tx.executeSql("DROP TABLE IF EXISTS " + tableName);
            return true
        }, function (error) {
            console.log("DELETE ERROR: " + tableName + " " + error.message);
            resolve(false);
        }, function () {
            console.log("DELETE OK " + tableName);
            resolve(true);
        });
    });
}

export async function clearDB() {
    await DB.transaction(async (tx) => {
        await tx.executeSql(`SELECT name FROM sqlite_master WHERE type='table'`, [], async (tx, results) => {
            try {
                for (let i = 0; i < results.rows.length; i++) {
                    let table = results.rows.item(i);
                    await tx.executeSql("DROP TABLE IF EXISTS " + table?.name);
                }
            } catch (error) {
                console.log(error, "delete table")
            }
        });
    }, function (error) {
        console.log(`Drop table ERROR: ${error.message}`);
    }, function () {
        console.log(`Drop table SUCCESS`);
    });

    createDB().catch((error) => console.log(error, "re-create DB error"));
}

export async function checkTableIsExists(tableNameNeedCheck: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        await DB.transaction(async (tx) => {
            await tx.executeSql(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableNameNeedCheck}'`, [], async (tx, results) => {
                resolve(results.rows.length > 0);
            });
        }, function (error) {
            console.log(`checkTableIsExists table ERROR: ${error.message}`);
            resolve(false);
        });
    })
}
