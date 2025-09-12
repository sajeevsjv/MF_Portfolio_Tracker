export const successResponse = (api_data)=>{
    let response = {
        status : true,
        statusCode : api_data.statusCode ? api_data.statusCode : 200,
        data : api_data ? api_data : null,
        message : api_data.message ? api_data.message : null,
    }
    return response;
}

export const errorResponse = (error_data)=>{
    let response = {
        status : false,
        statusCode : error_data.statusCode ? error_data.statusCode : 500,
        data : null,
        message : error_data.message ? error_data.message : "Something went wrong",
    }
    return response;
}