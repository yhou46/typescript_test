
import axios, {Axios, AxiosError, AxiosRequestConfig, AxiosResponse} from "axios"

async function delay(ms: number) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            console.log("timeout");
            resolve(`delayed ${ms} milliseconds`);
            reject(`delayed ${ms} milliseconds`);
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

interface ArmErrorResponse {
    error: {
        code: string,
        message: string
    }
}

export const enum FrsArmErrorCodeString {
    EmptyErrorCode = "",
    DefaultServerError = "InternalServerError",
    ServiceUnavailable = "ServiceUnavailable",
    FrsTenantAlreadyExists = "FrsTenantAlreadyExists",
    FrsContainerNotFound = "FrsContainerNotFound",
    FrsContainerStillActive = "FrsContainerStillActive",
    FrsContainerNotSummarized = "FrsContainerNotSummarized",
    FrsContainerDeletionFailed = "FrsContainerDeletionFailed",
    FrsCmkInvalidInput = "FrsCmkInvalidInput",
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
        public armErrorCode: FrsArmErrorCodeString,
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

function createArmErrorFromAxiosError(axiosError: AxiosError): ArmError {
    const errorData = axiosError.response?.data as ArmErrorResponse;
    if (errorData.error &&
        typeof (errorData.error?.code) === "string" &&
        typeof (errorData.error?.message) === "string") {
        return new ArmError(axiosError.response.status, errorData.error?.message, errorData.error?.code as FrsArmErrorCodeString);
    }
    else {
        return new ArmError(500, "Internal Server Error", FrsArmErrorCodeString.EmptyErrorCode);
    }
}

function handleArmErrorAndThrow(error: unknown) {
    if (axios.isAxiosError(error)) {
        const errorData = error.response.data as ArmErrorResponse;
        if (!!errorData.error &&
            typeof (errorData.error?.code) === "string" &&
            typeof (errorData.error?.message) === "string") {
            const errorCode = errorData.error?.code;
            console.log(errorCode);
            console.log(errorData);
        }
    }
}

async function run() {
    try {
        const requestUrl = "http://127.0.0.1:8000/reject";
        const axiosConfig: AxiosRequestConfig = {
            url: requestUrl,
            method: "GET",
        }
        await axios(
            axiosConfig
        );
    }
    catch (error) {
        handleArmErrorAndThrow(error);
    }
}



run();