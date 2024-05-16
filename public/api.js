
function API() {
    const BASE_API_URL = '.'

    function myFetch(path, data = {}, method = 'GET') {
        return fetch(BASE_API_URL + path + ((method == 'GET' && Object.keys(data) != 0) ? '?' + Object.keys(data).map(k => `${k}=${data[k]}`).join('&') : ''), {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method != 'GET' ? JSON.stringify(data || {}) : undefined,
            redirect: 'manual'
        })
        .then(res => res.json()).then(r => {
            console.log(r);
            return r
        })
    }

    return {
        getLoginedUser: data => myFetch('/user', data),
        login: data => myFetch('/login', data, 'POST'),
        signUp: data => myFetch('/register', data, 'POST'),
        getPeopleOfUserBaseInfo: data => myFetch('/allInfo', data),
        getPersonBaseInfo: data => myFetch('/info', data),
        getPersonDetailInfo: data => myFetch('', data),
        addPerson: data => myFetch('/addRelative', data,'POST'),
        updateFieldValues: data => myFetch('', data),
        addField: data => myFetch('', data),
        updateField: data => myFetch('', data),
        deleteField: data => myFetch('', data),
        drawFamilyTree: data => myFetch('', data)
    }
}

let api = API()
