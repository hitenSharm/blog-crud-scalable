const atLeastOneNotEmpty=(...args)=>{    
    for (const arg of args) {        
        if (arg !== undefined && arg !== null && arg !== '') {
            return true; // At least one parameter is not empty
        }
    }

    return false; // None of the parameters are non-empty
}

const allNonEmpty =(...args)=>{
    for(const arg of args){
        if (arg === undefined || arg === null && arg === '') {
            return false;
        }
    }
    return true;
}

module.exports={
    atLeastOneNotEmpty,
    allNonEmpty
};