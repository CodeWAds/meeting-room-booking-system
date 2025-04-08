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


