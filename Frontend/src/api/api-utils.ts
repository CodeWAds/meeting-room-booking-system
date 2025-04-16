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

export const postData = async (url, payload) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        return error;
    }
};

export const deleteData = async (url: string, payload?: any) => {
  try {
    const options: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    return await response.json(); 
  } catch (error) {
    console.error('Ошибка при DELETE-запросе:', error);
    return { error: error.message || 'Неизвестная ошибка' };
  }
};
