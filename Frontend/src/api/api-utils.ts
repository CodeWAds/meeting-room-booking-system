export const isResponseOk = (response) => {
    return !(response instanceof Error);
};

export const getData = async (url) => {
    try {
        const response = await fetch(url)

        if (response.status !== 200) {
            throw new Error
        }
        const data = await response.json()
        return data
    } catch (error) {
        return error;
    };
}

const normalizeDataObject = (obj) => {
    let str = JSON.stringify(obj);
    
    const newObj = JSON.parse(str);
    const result = { ...newObj, category: newObj.categories }
    return result;
}

export const normalizeData = (data) => {
    return data.map((item) => {
        return normalizeDataObject(item)
    })
};
