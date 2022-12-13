import * as nconf from "nconf"
import * as async from "async"
import { json } from "stream/consumers";
import { stringify } from "querystring";
import { StringDecoder } from "string_decoder";
import * as lodash from "lodash"
import * as uuid from "uuid";
import * as querystring from "querystring"
import * as assert from "assert"
import { count } from "console";
import axios, {Axios, AxiosError, AxiosResponse} from "axios"
import { TestEnum } from "./module_test"

class MyError extends Error {
    public type: string;
    constructor(
        public readonly httpStatus: number,
        public readonly message: string,
        public readonly code: number
    ){
        super(message);
        this.type = "MyError";
    }

    public get json() {
        return {
            httpStatus: this.httpStatus,
            message: this.message,
            code: this.code
        }
    }
}

class ChildError extends MyError {
    constructor(
        public readonly httpStatus: number,
        public readonly message: string,
        public readonly code: number,
        public readonly childCode: number
    ) {
        super(httpStatus, message, code);
    }

    public get json() {
        return {
            httpStatus: this.httpStatus,
            message: this.message,
            code: this.code,
            childCode: this.childCode,
            type: this.type,
        }
    }
}

async function delay(ms: number) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            console.log("timeout");
            resolve(`delayed ${ms} milliseconds`);
            reject(`delayed ${ms} milliseconds`);
        }, ms);
    });
}

async function delayWithCallback(ms: number, callback: () => void) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            console.log("timeout");
            callback();
            resolve(`delayed ${ms} milliseconds`);
        }, ms);
    });
}

async function delayAndReject(ms: number) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            console.log("timeout and reject");
            reject(`delayed ${ms} milliseconds and reject`);
        }, ms);
    });
}

async function testDelay() {
    try {
        await delay(1000);
    }
    catch (error) {
        console.log("Error in testDelay")
        throw error;
    }
}

async function test(error: MyError) {
    console.log(error.json);
}

export const enum ContainerManagerErrorType {
    FailedToDeleteDeltas = "abc",
    FailedToRetrieveContainerDetails = "bcd"
    
}

export const enum ContainerManagerErrorType2 {
    FailedToDeleteDeltas = "abc",
    FailedToRetrieveContainerDetails = "bcd"
    
}

function testEnumFunc(errorType: ContainerManagerErrorType) {
    console.log(`Error: ${errorType}`);
}

export const getLumberBaseProperties = (documentId: string, tenantId: string) => ({
    tenantId,
    documentId,
});

interface ArmErrorResponse {
    error: {
        code: string,
        message: string
    }
}

export class ArmError extends Error {
    constructor(
        /**
         * HTTP status code that describes the error.
         * @public
         */
        public code: number,
        /**
         * The message associated with the error.
         * @public inherited from Error
         */
        message: string,
        /**
         * Optional ARM error code.
         */
        public armErrorCode: string,
    ) {
        super(message);
        this.name = ArmError.ArmErrorName;
    }

    public static readonly ArmErrorName: string = "ArmError";

    public get details(): ArmErrorResponse {
        const armErrorResponse: ArmErrorResponse = {
            error: {
                code: this.armErrorCode,
                message: this.message,
            },
        };
        return armErrorResponse;
    }
}

export function isArmError(error: unknown): error is ArmError {
    return (error as ArmError).name === ArmError.ArmErrorName &&
        typeof (error as ArmError).code === "number" &&
        typeof (error as ArmError).message === "string";
}

interface AllSettledPromiseType {
    status: string,
    value?: any,
    reason?: any,
};
const allSettled = (promises: Promise<any>[]): Promise<AllSettledPromiseType[]> => {
    return Promise.all(
        promises.map((promise) => {
            return promise
                .then( (value) => {
                    return { status: 'fulfilled', value };
                })
                .catch((reason) => {
                    return { status: 'rejected', reason };
                });
            }
        )
    );
}


class MyError2 extends Error {
    constructor(errorEnum: TestEnum) {
        super(errorEnum);
    }
}

function handleError(error) {
    console.log("handleError called");
    throw error;
} 

async function run() {
    let value = 123;

    await Promise.all([
        delayWithCallback(1000, () => {
            ++value;
            console.log(`delay with 1000ms ${value}`);
        }),
        delayWithCallback(2000, () => {
            ++value;
            console.log(`delay with 1000ms ${value}`);
        }),
    ]);

}



if (require.main === module) {
    run();
}