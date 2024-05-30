
function API() {
    const BASE_API_URL = '.'
    const DEBUG = true

    function myFetch(path, data = {}, method = 'GET') {
        if (DEBUG) {
            console.log('Input', path, data)
        }
        return fetch(BASE_API_URL + path + ((method == 'GET' && Object.keys(data) != 0) ? '?' + Object.keys(data).map(k => `${k}=${data[k]}`).join('&') : ''), {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method != 'GET' ? JSON.stringify(data || {}) : undefined
        })
        .then(res => res.json())
        .then(outData => {
            if (DEBUG) {
                console.log('Output', path, outData)
            }
            return outData
        })
    }

    return {
        getLoggedU: data => myFetch('/user', data),
        login: data => myFetch('/login', data, 'POST'),
        signUp: data => myFetch('/register', data, 'POST'),
        getPPBsInf: data => myFetch('/allInfo', data),
        getPBsInf: data => myFetch('/info', data),
        getPDeatilInf: data => myFetch('/detailInfo', data),
        addPerson: data => myFetch('/addRelative', data,'POST'),
        updateFieldValues: data => myFetch('/updateFValue', data,'POST'),
        addField: data => myFetch('/addField', data,'POST'),
        updateField: data => myFetch('/updateField', data,'POST'),
        deleteField: data => myFetch('/deleteField', data,'POST'),
        drawFTree: data => myFetch('/drawFTree', data,'POST'), 
        getBsInfTgPeopleUCmEvts: data => myFetch('/baseInfPPUComingEvts', data), 
        getUpCmEvtTgInf: data => myFetch('/getUpcomingEvents', data), 
        udUpcomingEvtTarInf: data => myFetch('/updateUpcomingEvent', data,'POST'), 
        logout: data => myFetch('', data),
        deletePerson: data => myFetch('', data),
        statistic: data => myFetch('', data),
        backup: data => myFetch('', data),
        restore: data => myFetch('', data)
    }
}

let api = API()
