
function API() {
    const BASE_API_URL = '.'

    function myFetch(path, data = {}, method = 'GET') {
        if(method == 'GET'){
            return fetch(BASE_API_URL + path + (Object.keys(data).length == 0 ?'': '?' + Object.keys(data).map(k => k+'='+data[k]).join('&')), {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
        }
        return fetch(BASE_API_URL + path, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data || {})
        })
        .then(res => res.json())
    }

    return {
        getLoginedUser: data => myFetch('/user', data),
        login: data => myFetch('/login', data, 'POST'),
        signUp: data => myFetch('/register', data, 'POST'),
        getPeopleOfUserBaseInfo: data => myFetch('', data),
        getPersonBaseInfo: data => myFetch('', data),
        getPersonDetailInfo: data => myFetch('', data),
        addPerson: data => myFetch('', data),
        updateFieldValues: data => myFetch('', data),
        addField: data => myFetch('', data),
        updateField: data => myFetch('', data),
        deleteField: data => myFetch('', data),
        drawFamilyTree: data => myFetch('', data)
    }
}

let api = API()