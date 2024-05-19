
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
        getPersonDetailInfo: data => myFetch('/detailInfo', data),
        addPerson: data => myFetch('/addRelative', data,'POST'),
        updateFieldValues: data => myFetch('/updateFValue', data,'POST'),
        addField: data => myFetch('/addField', data,'POST'),
        updateField: data => myFetch('/updateField', data,'POST'),
        deleteField: data => myFetch('/deleteField', data,'POST'),
        drawFamilyTree: data => myFetch('', data)
    }
}

let api = API()
